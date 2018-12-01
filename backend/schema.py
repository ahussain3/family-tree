import graphene as gql
import gql_types
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
    gender = gql_types.GenderType()
    photo_url = gql.String()
    residence = gql.String()
    birth_year = gql.Int()
    death_year = gql.Int()
    # siblings = gql.List(Person)
    # parents = gql.List(Person)
    # marriages = gql.List(Marriage)

class Marriage(gql.ObjectType):
    """A marriage between two people"""
    id = gql.ID(required=True)
    # man = gql.Field(Person)
    # woman = gql.Field(Person)
    start_year = gql.Int()
    end_year = gql.Int()
    # children = gql.List(Person)

class AddPerson(gql.Mutation):
    class Arguments:
        name = gql.String(required=True)
        gender = gql_types.GenderType(required=True)
        residence = gql.String()
        birth_year = gql.Int()
        death_year = gql.Int()

    person = gql.Field(Person, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_person(info, **user_args)

class AddMarriage(gql.Mutation):
    class Arguments:
        man_id = gql.ID(required=True)
        woman_id = gql.ID(required=True)
        start_year = gql.Int()
        end_year = gql.Int()

    marriage = gql.Field(Marriage, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_marriage(info, **user_args)

class AddChild(gql.Mutation):
    class Arguments:
        marriage_id = gql.ID(required=True)
        child_id = gql.ID(required=True)

    marriage = gql.Field(Marriage, required=True)

    def mutate(self, info, **user_args):
        return mutate_add_child(info, **user_args)

class Query(gql.ObjectType):
    """Top level GraphQL queryable objects"""
    person = gql.Field(Person, id=gql.ID())
    search_persons = gql.Field(gql.List(Person), name=gql.String())

class Mutation(gql.ObjectType):
    add_person = AddPerson.Field(required=True)
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

def mutate_add_marriage(info, *, man_id, woman_id, start_year=None, end_year=None):
    man = database.get_node(man_id)
    woman = database.get_node(woman_id)

    assert man.get('gender') == gql_types.GenderType.MALE.value
    assert woman.get('gender') == gql_types.GenderType.FEMALE.value

    result = database.add_marriage(
        person_a=man,
        person_b=woman,
        start_year=start_year,
        end_year=end_year,
    )
    return AddMarriage(marriage=neo_to_gql(Marriage, result))

def mutate_add_child(info, *, marriage_id, child_id):
    marriage = database.get_node(marriage_id)
    child = database.get_node(child_id)

    result = database.add_child(
        marriage=marriage,
        child=child
    )
    return AddChild(marriage=neo_to_gql(Marriage, result))

schema = gql.Schema(query=Query, mutation=Mutation)

