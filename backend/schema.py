import graphene as gql
import gql_types
import database

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
    return cls(**fields)

# Object Types
class Person(gql.ObjectType):
    """A person in the family tree"""
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
    man = gql.Field(Person)
    woman = gql.Field(Person)
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

class Query(gql.ObjectType):
    """Top level GraphQL queryable objects"""
    person = gql.Field(Person, name=gql.String())
    search_persons = gql.Field(gql.List(Person), name=gql.String())

class Mutation(gql.ObjectType):
    add_person = AddPerson.Field(required=True)

# Resolvers
@resolver_for(Query, "person")
def query_person(self, info, *, name):
    return Person(
        name="Blah",
        gender=gql_types.GenderType.MALE
    )

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
        death_year=death_year
    )
    return AddPerson(person=neo_to_gql(Person, result))


schema = gql.Schema(query=Query, mutation=Mutation)

