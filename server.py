from flask import Flask, render_template
from flask_assets import Environment, Bundle
import yaml
import json

CONFIG_LOC = "config.yml"
LABS_LOC = "static/data/labs.json"

app = Flask(__name__)
assets = Environment(app)

js = Bundle(
    Bundle('js/course_catalog.js','js/interactivity.js','js/validation.js'),
    Bundle('js/navigation.coffee',filters='coffeescript'),
    output='gen/packed.js')
assets.register('js_all', js)


@app.route("/")
def index():
    with open(CONFIG_LOC, 'r') as file:
        config = yaml.load(file)
    with open(LABS_LOC, 'r') as file:
        labs = json.load(file)
    return render_template("index.html", categories=config["categories"], labs = labs)
