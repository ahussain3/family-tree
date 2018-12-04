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
    parents = gql.List(lambda: Person)
    # siblings = gql.List(lambda: Person)
    partners = gql.List(lambda: Person)
    children = gql.List(lambda: Person)

class AddPerson(gql.Mutation):
    class Arguments:
        name = gql.String(required=True)
        gender = GenderType(required=True)
        residence = gql.String()
        birth_year = gql.Int()
        death_year = gql.Int()

    person = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_person(info, **user_args)

class UpdatePerson(gql.Mutation):
    class Arguments:
        id = gql.ID(required=True)
        name = gql.String()
        gender = GenderType()
        residence = gql.String()
        birth_year = gql.Int()
        death_year = gql.Int()

    person = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_update_person(info, **user_args)


class AddMarriage(gql.Mutation):
    class Arguments:
        partner_a_id = gql.ID(required=True)
        partner_b_id = gql.ID(required=True)
        start_year = gql.Int()
        end_year = gql.Int()

    partner_a = gql.Field(Person, required=True)
    partner_b = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_marriage(info, **user_args)

class AddChild(gql.Mutation):
    class Arguments:
        parent_ids = gql.List(gql.ID, required=True)
        child_id = gql.ID(required=True)

    child = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_child(info, **user_args)

class Query(gql.ObjectType):
    """Top level GraphQL queryable objects"""
    person = gql.Field(Person, id=gql.ID())
    search_persons = gql.Field(gql.List(Person), name=gql.String())

class Mutation(gql.ObjectType):
    add_person = AddPerson.Field(required=True)
    update_person = UpdatePerson.Field(required=True)
    add_marriage = AddMarriage.Field(required=True)
    add_child = AddChild.Field(required=True)




# Resolvers
@resolver_for(Query, "person")
def query_person(self, info, *, id):
    person = database.get_node(id)
    return neo_to_gql(Person, person)

@resolver_for(Query, "search_persons")
def query_search_persons(self, info, *, name):
    persons = database.search_persons(name)
    return [neo_to_gql(Person, person) for person in persons]

@resolver_for(Person, "parents")
def person_parents(self, info):
    result = database.get_parents(self.id)
    return [neo_to_gql(Person, person) for person in result]

@resolver_for(Person, "children")
def person_children(self, info):
    result = database.get_children(self.id)
    return [neo_to_gql(Person, person) for person in result]

@resolver_for(Person, "partners")
def person_partners(self, info):
    result = database.get_partners(self.id)
    return [neo_to_gql(Person, person) for person in result]

# Mutators
def mutate_add_person(info, *, name, gender, residence=None, birth_year=None, death_year=None):
    result = database.add_person(
        name=name,
        gender=gender,
        residence=residence,
        birth_year=birth_year,
        death_year=death_year,
    )
    return AddPerson(person=neo_to_gql(Person, result))

def mutate_update_person(info, *, id, name=None, gender=None, residence=None, birth_year=None, death_year=None):
    args = locals().copy()
    args.pop("info", None)
    person = database.update_person(**args)
    return UpdatePerson(person=neo_to_gql(Person, person))

def mutate_add_marriage(info, *, partner_a_id, partner_b_id, start_year=None, end_year=None):
    partner_a = database.get_node(partner_a_id)
    partner_b = database.get_node(partner_b_id)

    result = database.add_marriage(
        person_a=partner_a,
        person_b=partner_b,
        start_year=start_year,
        end_year=end_year,
    )
    partner_a, partner_b = (neo_to_gql(Person, person) for person in result)

    return AddMarriage(partner_a=partner_a, partner_b=partner_b)

def mutate_add_child(info, *, parent_ids, child_id):
    child = database.get_node(child_id)

    for parent_id in parent_ids:
        assert child_id != parent_id, "A person cannot be their own child"

        parent = database.get_node(parent_id)

        database.add_child(
            parent=parent,
            child=child
        )

    return AddChild(child=neo_to_gql(Person, child))

schema = gql.Schema(query=Query, mutation=Mutation)

