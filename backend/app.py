from flask import Flask
app = Flask(__name__)

from py2neo import Graph

graph = Graph("bolt://localhost:7687", auth=('neo4j', 'banana01'))

@app.route('/')
def root():
    graph.
    return 'This is my server'