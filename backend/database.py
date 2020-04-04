import base64
import secrets
import os
from enum import Enum

from py2neo import Node, Graph, Relationship, NodeMatcher, RelationshipMatcher

DB_HOSTNAME = os.environ.get("DB_HOSTNAME", "localhost")
DB_USER = os.environ.get("DB_USER", "neo4j")
DB_PASSWD = os.environ.get("DB_PASSWD", "banana01")

graph = Graph(f"bolt://{DB_HOSTNAME}:7687", auth=(DB_USER, DB_PASSWD))

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

def get_node_or_none(opaque_id):
    try:
        get_node(opaque_id)
    except ReferenceError:
        return None

def get_relationship(nodes, rel_type):
    matcher = RelationshipMatcher(graph)
    return matcher.match(nodes, rel_type).first()

def get_relationships(opaque_id, rel_type):
    person = get_node(opaque_id)
    matcher = RelationshipMatcher(graph)
    return [p.end_node for p in matcher.match([person], rel_type)]

def get_parents(opaque_id):
    result = get_relationships(opaque_id, RelationshipType.PARENT.value)
    return sorted(result, key=lambda p: p["gender"], reverse=True)

def get_children(opaque_id):
    result = get_relationships(opaque_id, RelationshipType.CHILD.value)
    return sorted(result, key=lambda p: p["birth_year"] or 0)

def get_partners(opaque_id):
    result = get_relationships(opaque_id, RelationshipType.PARTNER.value)
    return sorted(result, key=lambda p: p["birth_year"] or 0)

def is_married(person_a, person_b):
    return get_relationship([person_a, person_b], RelationshipType.PARTNER.value) is not None

def search_persons(name):
    matcher = NodeMatcher(graph)
    result = matcher.match(NodeType.PERSON.value).where(f"_.name =~ '.*(?i){name}.*'").limit(10)
    return list(result)

# Create new entries
def generate_id():
    return make_opaque_id("P")

def upsert_person(id, **kwargs):
    person = get_node_or_none(id)
    if person is None:
        person = Node(NodeType.PERSON.value, opaque_id=id, **kwargs)
        graph.create(person)

    person.update({k:v for k,v in kwargs.items() if v is not None})
    graph.push(person)
    return person

def delete_parents(child):
    for parent in get_parents(child["opaque_id"]):
        graph.separate(get_relationship([child, parent], RelationshipType.PARENT.value))
        graph.separate(get_relationship([parent, child], RelationshipType.CHILD.value))

def set_parents(marriage_id, child):
    parent_ids = marriage_id.split("+")
    delete_parents(child)

    for parent_id in parent_ids:
        parent = get_node(parent_id)
        add_child(parent, child)


def delete_children(person_a, person_b):
    a_children = get_children(person_a["opaque_id"])
    b_children = get_children(person_b["opaque_id"])

    children = [child for child in a_children if child in b_children]

    for child in children:
        delete_parents(child)

def delete_marriages(person):
    for partner in get_partners(person["opaque_id"]):
        graph.separate(get_relationship([person, partner], RelationshipType.PARTNER.value))
        graph.separate(get_relationship([partner, person], RelationshipType.PARTNER.value))
        delete_children(person, partner)

def add_marriage(person_a, person_b, children):
    if not is_married(person_a, person_b):
        rel_a=Relationship(person_a, RelationshipType.PARTNER.value, person_b)
        rel_b=Relationship(person_b, RelationshipType.PARTNER.value, person_a)

        graph.create(rel_a)
        graph.create(rel_b)

    delete_children(person_a, person_b)

    for child in children:
        add_child(person_a, child)
        add_child(person_b, child)

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