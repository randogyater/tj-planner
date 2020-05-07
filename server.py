from flask import Flask, render_template, g
import yaml

CONFIG_LOC = "config.yml"

app = Flask(__name__)


@app.route("/")
def index():
    with open(CONFIG_LOC, 'r') as file:
        config = yaml.load(file)
    return render_template("index.html", categories=config["categories"])
