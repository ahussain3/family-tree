import graphene as gql
from gql_types import GenderType
import database
import random

def resolver_for(cls, name):
    def decorator(f):
        # We just fill in the resolve_xxx function onto the class
        setattr(cls, f"resolve_{name}", f)
        return f
    return decorator

def mutator_for(cls):
    def decorator(f):
        cls.mutate = staticmethod(f)
        return f
    return decorator

def neo_to_gql(cls, object):
    fields = {field: object.get(field) for field in cls._meta.fields.keys()}
    fields['id'] = object.get('opaque_id', str(random.randint(0,5000)))
    return cls(**fields)

def mk_person(object):
    return neo_to_gql(Person, object)

def mk_marriage(partner_a, partner_b):
    partners = sorted([partner_a, partner_b], key=lambda p: p.id)
    return Marriage(id=f"{partners[0].id}+{partners[1].id}")

# Object Types
class Person(gql.ObjectType):
    """A person in the family tree"""
    id = gql.ID(required=True)
    name = gql.String(required=True)
    gender = GenderType()
    photo_url = gql.String()
    residence = gql.String()
    birth_year = gql.Int()
    death_year = gql.Int()
    biography = gql.String()
    parents = gql.Field(lambda: Marriage, required=False)
    marriages = gql.List(lambda: Marriage)

class Marriage(gql.ObjectType):
    """A marriage between two people"""
    id = gql.ID(required=True)
    start_year = gql.Int()
    end_year = gql.Int()
    partners = gql.List(lambda: Person)
    children = gql.List(lambda: Person)

class MarriageInput(gql.InputObjectType):
    partner_b_id = gql.String(required=True)
    children = gql.List(gql.String)

class UpsertPerson(gql.Mutation):
    class Arguments:
        id = gql.ID()
        name = gql.String()
        gender = GenderType()
        residence = gql.String()
        birth_year = gql.Int()
        death_year = gql.Int()
        biography = gql.String()
        parents = gql.String()
        marriages = gql.List(MarriageInput)

    person = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_upsert_person(info, **user_args)

class AddMarriage(gql.Mutation):
    class Arguments:
        partner_b_id = gql.ID(required=True)
        start_year = gql.Int()
        end_year = gql.Int()

    marriage = gql.Field(Marriage, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_marriage(info, **user_args)

class AddChildren(gql.Mutation):
    class Arguments:
        marriage_id = gql.ID(required=True)
        children_ids = gql.List(gql.ID, required=True)

    children = gql.Field(gql.List(Person), required=True)

    def mutate(self, info, **user_args):
        return mutate_add_children(info, **user_args)

class Query(gql.ObjectType):
    """Top level GraphQL queryable objects"""
    person = gql.Field(Person, id=gql.ID())
    search_persons = gql.Field(gql.List(Person), name=gql.String())
    search_marriages = gql.Field(gql.List(Marriage), name=gql.String())

class Mutation(gql.ObjectType):
    upsert_person = UpsertPerson.Field(required=True)
    add_marriage = AddMarriage.Field(required=True)
    add_children = AddChildren.Field(required=True)

# Resolvers
@resolver_for(Query, "person")
def query_person(self, info, *, id):
    person = database.get_node(id)
    return mk_person(person)

@resolver_for(Query, "search_persons")
def query_search_persons(self, info, *, name):
    persons = database.search_persons(name)
    return [mk_person(person) for person in persons]

@resolver_for(Query, "search_marriages")
def query_search_marriages(self, info, *, name):
    persons = database.search_persons(name)
    result = []
    for person in persons:
        partners = database.get_partners(person['opaque_id'])
        result = result + [mk_marriage(mk_person(person), mk_person(partner)) for partner in partners]
    return result

@resolver_for(Person, "parents")
def person_parents(self, info):
    parents = database.get_parents(self.id)
    if not parents:
        return None

    return mk_marriage(
        partner_a=mk_person(parents[0]),
        partner_b=mk_person(parents[1]),
    )

@resolver_for(Person, "photo_url")
def person_photo_url(self, info):
    return "https://images.unsplash.com/photo-1564694245232-0a1ad9f3cd38?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80"

@resolver_for(Person, "marriages")
def person_marriages(self, info):
    partners = database.get_partners(self.id)
    return [mk_marriage(self, mk_person(partner)) for partner in partners]

@resolver_for(Marriage, "partners")
def marriage_partners(self, info):
    partner_ids = self.id.split("+")
    partners = [database.get_node(partner_id) for partner_id in partner_ids]
    return [mk_person(partner) for partner in partners]

@resolver_for(Marriage, "children")
def marriage_children(self, info):
    (partner_a, partner_b) = self.id.split("+")
    children_a = [mk_person(child) for child in database.get_children(partner_a)]
    children_b = [mk_person(child) for child in database.get_children(partner_b)]

    # find the intersection of the two lists
    children_b_ids = set(child.id for child in children_b)
    children = [child for child in children_a if child.id in children_b_ids]
    return sorted(children, key=lambda child: child.birth_year or 0)

# Mutators
def mutate_upsert_person(
    info, *,
    id=None,
    name=None,
    gender=None,
    residence=None,
    birth_year=None,
    death_year=None,
    biography=None,
    parents=None,
    marriages=None,
):
    marriages = marriages or []

    # PERSONAL DETAILS
    if id is None:
        person = database.add_person(
            name=name,
            gender=gender,
            residence=residence,
            birth_year=birth_year,
            death_year=death_year,
            biography=biography,
        )
    else:
        person = database.update_person(
            id=id,
            name=name,
            gender=gender,
            residence=residence,
            birth_year=birth_year,
            death_year=death_year,
            biography=biography
        )

    # PARENTS
    if parents is None:
        database.delete_parents(person)
    else:
        database.set_parents(parents, person)

    # MARRIAGES
    database.delete_marriages(person)  # this seems dangerous?

    for marriage in marriages:
        partner_a = person
        partner_b = database.get_node(marriage.partner_b_id)
        children = [database.get_node(child_id) for child_id in marriage.children]

        database.add_marriage(partner_a, partner_b, children)

    return UpsertPerson(person=mk_person(person))



schema = gql.Schema(query=Query, mutation=Mutation)