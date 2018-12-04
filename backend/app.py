from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS, cross_origin

from schema import schema

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def root():
    return "Hello world! Go to /graphql"

# Graphql endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,
    )
)

