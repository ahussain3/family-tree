from enum import Enum

from py2neo import Node, Graph, Relationship, NodeMatcher

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

# Node Types
class NodeType(Enum):
    PERSON = "Person"
    MARRIAGE = "Marriage"

# Relationships
class Child(Relationship): pass
class Partner(Relationship): pass

# Create new entries
def add_person(name, gender, *, residence, birth_year, death_year):
    person = Node(NodeType.PERSON.value, **locals())
    graph.create(person)
    return person

def add_marriage(person_a, person_b, *, year_started, year_ended):
    marriage = Node(NodeType.MARRIAGE.value, year_started=year_started, year_ended=year_ended)
    Partner(marriage, person_a)
    Partner(marriage, person_b)
    return marriage

def search_persons(name):
    matcher = NodeMatcher(graph)
    result = matcher.match(NodeType.PERSON.value, name__contains=name).limit(10)
    return list(result)
