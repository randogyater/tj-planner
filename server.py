from flask import Flask, render_template
from flask_assets import Environment, Bundle
import yaml

CONFIG_LOC = "config.yml"

app = Flask(__name__)
assets = Environment(app)

js = Bundle(
    Bundle('js/course_catalog.js','js/interactivity.js'),
    Bundle('js/navigation.coffee',filters='coffeescript'),
    output='gen/packed.js')
assets.config["coffee_bin"] = "./node_modules/coffeescript/bin/coffee"
assets.register('js_all', js)


@app.route("/")
def index():
    with open(CONFIG_LOC, 'r') as file:
        config = yaml.load(file)
    return render_template("index.html", categories=config["categories"])
