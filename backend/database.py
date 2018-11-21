import base64
import secrets
from enum import Enum

from py2neo import Node, Graph, Relationship, NodeMatcher

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

# Node Types
class NodeType(Enum):
    PERSON = "Person"
    MARRIAGE = "Marriage"

class RelationshipType(Enum):
    PARTNER = "PARTNER"  # should go from 'marriage' node to 'person' node
    CHILD = "CHILD"  # should go from 'marriage' to 'child'

# To do: Constraints
# graph.schema.create_uniqueness_constraint(NodeType.PERSON.value, 'opaque_id')
# graph.schema.create_uniqueness_constraint(NodeType.MARRIAGE.value, 'opaque_id')

def make_opaque_id(prefix):
    val = (
        base64.urlsafe_b64encode(secrets.token_bytes(9))
        .decode("utf-8")
        .rstrip("=")
        .replace("_", "-")
    )
    return prefix + "_" + val

def get_node(opaque_id):
    if opaque_id[:2] == "P_":
        node_type = NodeType.PERSON.value
    elif opaque_id[:2] == "M_":
        node_type = NodeType.MARRIAGE.value
    else:
        raise ValueError(f"I don't understand the id: {opaque_id}")

    matcher = NodeMatcher(graph)
    result = matcher.match(node_type, opaque_id=opaque_id)
    if not result:
        raise ReferenceError(f"No result found for id: {opaque_id}")

    assert len(result) == 1, f"More than one record with the same id: {opaque_id}"

    return result.first()

def search_persons(name):
    matcher = NodeMatcher(graph)
    result = matcher.match(NodeType.PERSON.value, name__contains=name).limit(10)
    return list(result)

# Create new entries
def add_person(name, gender, *, residence, birth_year, death_year):
    person = Node(NodeType.PERSON.value, opaque_id=make_opaque_id("P"), **locals())
    graph.create(person)
    return person

def add_marriage(person_a, person_b, *, start_year, end_year):
    marriage = Node(NodeType.MARRIAGE.value, opaque_id=make_opaque_id("M"), start_year=start_year, end_year=end_year)
    graph.create(marriage)

    rel_ma = Relationship(marriage, RelationshipType.PARTNER.value, person_a)
    rel_mb = Relationship(marriage, RelationshipType.PARTNER.value, person_b)

    graph.create(rel_ma)
    graph.create(rel_mb)

    return marriage

def add_child(marriage, child):
    rel = Relationship(marriage, RelationshipType.CHILD.value, child)
    graph.create(rel)

    return marriage