import os

from flask import Flask, request, send_file, render_template
from flask_graphql import GraphQLView
from flask_cors import CORS, cross_origin

import hashlib
import database

from schema import schema

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # max 5mb file upload

PHOTO_UPLOAD_PATH = os.environ.get("PHOTO_UPLOAD_PATH", "profile_photos")

import pprint

@app.before_request
def log_request_info():
    app.logger.debug('POST BODY: %s', pprint.pprint(request.form))

@app.route('/')
def root():
    return render_template("index.html")

# Graphql endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,
    )
)

@app.route('/photo_upload', methods=["GET", "POST"])
def photo_upload():
    """Upload a profile photo"""
    if request.method == "GET":
        return "Welcome to the photo upload endpoint!"

    id = request.form["id"]
    file = request.files["profile_photo"]
    extension = file.filename.split(".")[-1]
    if extension not in ("png", "jpg", "jpeg"):
        return "Filetype not recognized", 415

    # figure out a naming scheme for the file
    file_data = file.read()
    digest = hashlib.md5(file_data).hexdigest()
    photo_name = f"{digest}.{extension}"
    path = os.path.join(PHOTO_UPLOAD_PATH, photo_name)

    # don't reupload if the picture already exists
    if not os.path.isfile(path):
        with open(path, "w"):
            file.seek(0)
            file.save(path)

    # figure out how to attach the picture to a person
    database.add_profile_photo(id, photo_name)

    # (later) do some image processing to generate thumbnails and minify
    # (later) figure out multiple pictures per person

    return "ok, all done"

@app.route('/photo/<photo_name>/', methods=["GET"])
def photo(photo_name: str):
    """Retrieve a profile photo"""
    path = os.path.join(PHOTO_UPLOAD_PATH, photo_name)
    if not os.path.isfile(path):
        return "No photo found", 404

    return send_file(path)
