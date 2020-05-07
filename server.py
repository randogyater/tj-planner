from flask import Flask, render_template, g
import yaml

CONFIG_LOC = "config.yml"

app = Flask(__name__)


def get_config(field=None):
    if "config" not in g:
        with open(CONFIG_LOC, 'r') as file:
            g.config = yaml.load(file)
    if field:
        return g.config[field]
    else:
        return g.config


@app.route("/")
def index():
    return render_template("index.html", categories=get_config("categories"))
