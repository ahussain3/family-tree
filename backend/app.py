from flask import Flask
from py2neo import Graph
from flask_graphql import GraphQLView
from flask_cors import CORS, cross_origin

from schema import schema

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

@app.route('/')
def root():
    result = graph.nodes.match("Person", name="Zahid Hussain")
    return str(result.first())

# Graphql endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,
    )
)

