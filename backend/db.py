from py2neo import Node, Graph, Relationship

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

# Node Types
class NodeType(Enum):
    PERSON = "Person"
    MARRIAGE = "Marriage"

# Relationships
class Child(Relationship): pass
class Partner(Relationship): pass

# Create new entries
def person(name, gender, *, residence, birth_year, death_year)
    return Node(NodeType.PERSON, **locals())

def marriage(person_a, person_b, *, year_started, year_ended):
    marriage = Node(NodeType.MARRIAGE, year_started=year_started, year_ended=year_ended)
    Partner(marriage, person_a)
    Partner(marriage, person_b)
    return marriage

