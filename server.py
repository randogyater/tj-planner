from flask import Flask, render_template
from flask_assets import Environment, Bundle
import yaml
import json

CONFIG_LOC = "config.yml"
COURSES_LOC = "static/data/courses.json"
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
    with open(COURSES_LOC, 'r') as file:
        courses = json.load(file)
    with open(LABS_LOC, 'r') as file:
        labs = json.load(file)
    
    categorized = dict()
    for course in courses:
        course = courses[course]
        if course["category"] not in categorized:
            categorized[course["category"]] = list()
        categorized[course["category"]].append(course)
    return render_template("index.html", categories=config["categories"], categorized = categorized, labs = labs)
