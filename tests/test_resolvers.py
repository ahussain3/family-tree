import graphene.test
from src.schema import schema
import src.database as db


def test_hello_world():
    client = graphene.test.Client(schema=schema)
    db.upsert_person("P_askjdsklo")
    import pdb; pdb.set_trace();
    return