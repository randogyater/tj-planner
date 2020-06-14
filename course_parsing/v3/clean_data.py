import json

SOURCE = "/course_parsing/v3/courses.json"
LOWERCASE = {
    "and",
    "for",
    "with"
}


def titlecase(string):
    return " ".join(word if word in LOWERCASE else word.capitalize() for word in string.split(" ")).replace("Advanced Placement", "AP")


def fix_names(courses):
    for course_id in courses:
        course = courses[course_id]
        course["full_name"] = titlecase(course["full_name"])


if __name__ == "__main__":
    with open(SOURCE, 'r') as file:
        courses = json.load(file)
    fix_names(courses)
    with open(SOURCE, 'w') as file:
        file.write(json.dumps(courses, indent=4))