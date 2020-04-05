import graphene.test
from src.schema import schema


def test_hello_world():
    client = graphene.test.Client(schema=schema)
    import pdb; pdb.set_trace();
    return