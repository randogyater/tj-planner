from flask import Flask, render_template
from flask_assets import Environment, Bundle
import yaml
import json
import subprocess

CONFIG_LOC = "config.yml"
INFO_LOC = "info.yml"
COURSES_LOC = "static/data/courses.json"
LABS_LOC = "static/data/labs.json"
GITHUB_URL = "https://github.com/greenturtle1134/tj-planner/commit/"

app = Flask(__name__)
assets = Environment(app)

js = Bundle(
    Bundle('js/constants.js','js/course_catalog.js','js/interactivity.js','js/validation.js'),
    Bundle('js/navigation.coffee','js/grad_requirements.coffee','js/placeholder.coffee','js/sort_labs.coffee',filters='coffeescript'),
    output='gen/packed.js')
assets.register('js_all', js)
with open(CONFIG_LOC, 'r') as file:
    config = yaml.load(file, Loader=yaml.FullLoader)
assets.config["coffee_bin"] = config["coffee_path"]


def kebab(string):
    return string.lower().replace(" ", "-")


def get_version():
    name = subprocess.run(["git", "describe", "--tags"], stdout=subprocess.PIPE)
    commit = subprocess.run(["git", "rev-parse", "HEAD"], stdout=subprocess.PIPE)
    name = name.stdout.decode().strip()
    commit = commit.stdout.decode().strip()
    return name, (GITHUB_URL + commit)


def ordering_key(course):
    if course["category"] == "World Languages":
        # Languages are sorted by language then level
        if course["short_name"].startswith("AP"):
            return course["short_name"][3:]
        else:
            return course["short_name"]
    if course["category"] == "English":
        # English gets a bit wacky if you sort it the usual way, let's put all core classes at the top
        return "English" not in course["full_name"], [not(x) for x in course["availability"]], course["full_name"]
    return course["lexographic"], 0 if course["ap"] == "pre" else (1 if course["ap"] == "ap" else 2), [not(x) for x in course["availability"]], course["full_name"]


@app.route("/")
def index():
    with open(INFO_LOC, 'r') as file:
        info = yaml.load(file, Loader=yaml.FullLoader)
    with open(COURSES_LOC, 'r') as file:
        courses = json.load(file)
    with open(LABS_LOC, 'r') as file:
        labs = json.load(file)

    categorized = dict()
    for course in courses:
        course = courses[course]
        if course["ap"] == "ap":
            course["ap_class"] = "course--ap"
        elif course["ap"] =="post":
            course["ap_class"] = "course--post-ap"
        else:
            course["ap_class"] = "pre-ap"
        course["category_class"] = "course--"+kebab(course["category"])
        course["grades"] = [str(x+9) for x in range(4) if course["availability"][x]]
        if course["category"] not in categorized:
            categorized[course["category"]] = list()
        categorized[course["category"]].append(course)
    
    version, version_url = get_version()
    return render_template("index.html",
                            categories=info["categories"],
                            categorized = [(category, sorted(categorized[category], key = ordering_key)) for category in info["categories"]],
                            courses = courses,
                            labs = labs, kebab = kebab, info = info, version = version, version_url = version_url,
                            requirements=[
                                ("math", "4 Math credits", 4),
                                ("history", "Fourth history credit", 1),
                                ("lang", "3 years of a language", 3),
                                ("pe", "2 PE credits", 2),
                                ("econ", "Economics", 1),
                                ("rs1", "RS1 must be first Math class", 1),
                                ("cs", "CS must be taken before 11th grade", 1),])
