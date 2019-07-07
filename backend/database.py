import base64
import secrets
from enum import Enum

from py2neo import Node, Graph, Relationship, NodeMatcher, RelationshipMatcher

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

# Node Types
class NodeType(Enum):
    PERSON = "Person"

class RelationshipType(Enum):
    PARTNER = "PARTNER"
    CHILD = "CHILD"
    PARENT = "PARENT"

# To do(Awais): Constraints
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
    else:
        raise ValueError(f"I don't understand the id: {opaque_id}")

    matcher = NodeMatcher(graph)
    result = matcher.match(node_type, opaque_id=opaque_id)
    if not result:
        raise ReferenceError(f"No result found for id: {opaque_id}")

    assert len(result) == 1, f"More than one record with the same id: {opaque_id}"

    return result.first()

def get_relationship(opaque_id, rel_type):
    person = get_node(opaque_id)
    matcher = RelationshipMatcher(graph)
    return [p.end_node for p in matcher.match([person], rel_type)]

def get_parents(opaque_id):
    result = get_relationship(opaque_id, RelationshipType.PARENT.value)
    return sorted(result, key=lambda p: p["gender"], reverse=True)

def get_children(opaque_id):
    result = get_relationship(opaque_id, RelationshipType.CHILD.value)
    return sorted(result, key=lambda p: p["birth_year"])

def get_partners(opaque_id):
    result = get_relationship(opaque_id, RelationshipType.PARTNER.value)
    return sorted(result, key=lambda p: p["birth_year"])

def search_persons(name):
    matcher = NodeMatcher(graph)
    result = matcher.match(NodeType.PERSON.value).where(f"_.name =~ '.*(?i){name}.*'").limit(10)
    return list(result)

# Create new entries
def add_person(name, gender, *, residence, birth_year, death_year):
    person = Node(NodeType.PERSON.value, opaque_id=make_opaque_id("P"), **locals())
    graph.create(person)
    return person

def update_person(id, **kwargs):
    person = get_node(id)
    person.update({k:v for k,v in kwargs.items() if v is not None})
    graph.push(person)
    return person

def add_marriage(person_a, person_b, *, start_year, end_year):
    rel_a = Relationship(person_a, RelationshipType.PARTNER.value, person_b, start_year=start_year, end_year=end_year)
    rel_b = Relationship(person_b, RelationshipType.PARTNER.value, person_a, start_year=start_year, end_year=end_year)

    graph.create(rel_a)
    graph.create(rel_b)

    return (person_a, person_b)

def update_marriage(person_a, person_b):
    # TODO(Awais)
    pass

def add_child(parent, child):
    rel_a = Relationship(parent, RelationshipType.CHILD.value, child)
    rel_b = Relationship(child, RelationshipType.PARENT.value, parent)

    graph.create(rel_a)
    graph.create(rel_b)

    return (parent, child)