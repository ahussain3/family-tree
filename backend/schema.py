import graphene as gql
import gql_types
import database

def resolver_for(cls, name):
    def inner(f):
        # We just fill in the resolve_xxx function onto the class
        setattr(cls, f"resolve_{name}", f)
        return f
    return inner

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

class Query(gql.ObjectType):
    """Top level GraphQL queryable objects"""
    person = gql.Field(Person, name=gql.String())
    search_persons = gql.Field(gql.List(Person), name=gql.String())

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

schema = gql.Schema(query=Query)

