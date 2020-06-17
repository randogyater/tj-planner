import json
import re

SOURCE = "static/data/courses.json"
LOWERCASE = {
    "and",
    "for",
    "with"
}
UPPERCASE = {
    "TJ",
    "AP",
    "BC",
    "AB",
    "CS",
    "VA",
    "DNA"
}


def titlecase(string):
    return " ".join(word.lower() if word.lower() in LOWERCASE else (word.upper() if word.upper() in UPPERCASE else word.capitalize()) for word in string.split(" ")).replace("Advanced Placement", "AP")


def fix_names(courses):
    for course_id in courses:
        course = courses[course_id]
        course["full_name"] = titlecase(course["full_name"])
        course["short_name"] = titlecase(course["short_name"])


def remove_labs(courses):
    labs = list()
    for course_id in courses:
        name = courses[course_id]["full_name"]
        if name.endswith("Research") or name.endswith("Res"):
            labs.append(course_id)
    for course in labs:
        del courses[course]


def resolve_prereqs(courses, replace=False):
    course_to_id = dict()
    for course_id in courses:
        course = courses[course_id]
        course_to_id[course["full_name"].lower()] = course_id
        course_to_id[course["short_name"].lower()] = course_id
    for course_id in courses:
        course = courses[course_id]
        if "prereqs" not in course or replace:
            parsed = parse_prereq(course["prereq_string"], course_to_id, course["short_name"])
            if parsed:
                course["prereqs"] = parsed
            else:
                print("Could not parse: %s (%s)" % (course["full_name"], course["prereq_string"]))


def parse_prereq(prereq, name_to_id, course_name):
    prereq = prereq.lower()
    if prereq == "" or prereq == "none":
        return list(), False, False
    result = list()
    splitter = re.compile(r',? or |, ')
    test = False
    approval = False
    for subsection in splitter.split(prereq):
        if "equivalency" in subsection:
            test = True
        elif "permission" in subsection:
            approval = True
        elif "audition" in subsection:
            pass
        else:
            section = list()
            for requirement in subsection.split(" and "):
                if requirement in name_to_id:
                    section.append(name_to_id[requirement])
                else:
                    if subsection in name_to_id:
                        section = [name_to_id[subsection]]
                        break
                    else:
                        replacement = input("Substitute for \"%s\" in %s: " % (requirement, course_name)).lower()
                        if replacement in name_to_id:
                            section.append(name_to_id[replacement])
                            print("Replacement found:", name_to_id[replacement])
                        elif replacement == "ignore":
                            continue
                        else:
                            return None
            result.append(section)
    return result, test, approval



def remove_coreqs(courses):
    # Okay, TECHNICALLY we could do the same thing as for prereqs
    # But nothing has coreqs except for AP Physics
    # So let's just get rid of them
    for course_id in courses:
        del courses[course_id]["coreq_string"]



def correct_prereqs(courses):
    # This exists ONLY because I messed up and included the test and approval fields in the prereq list the first time
    for course_id in courses:
        course = courses[course_id]
        if "prereqs" in course:
            prereqs = course["prereqs"]
            course["skiptest"] = prereqs[-2]
            course["approval"] = prereqs[-1]
            course["prereqs"] = prereqs[:-2]
    # And THIS exists because I failed to de-nest properly with the above
    for course_id in courses:
        course = courses[course_id]
        if "prereqs" in course:
            course["prereqs"] = course["prereqs"][0]
    # And THIS exists because I needed to delete the skippable field
    for course_id in courses:
        del courses[course_id]["skippable"]
    # I'm just embarrased enough about all this that I might just comment it all out


def list_categories(courses):
    categories = set()
    for course_id in courses:
        categories.add(courses[course_id]["category"])
    return categories


def set_ap(courses):
    for course_id in courses:
        course = courses[course_id]
        if course["weight"] > 0.9:
            if "AP" in course["short_name"]:
                course["ap"] = "ap"
            else:
                course["ap"] = "post"
        else:
            course["ap"] = "pre"


def add_summer_and_online(courses):
    for course_id in courses:
        course = courses[course_id]
        course["summer"] = False
        course["online"] = False
        course["online_only"] = False


def set_empty_prereqs(courses):
    for course_id in courses:
        if "prereqs" not in courses[course_id] or all(len(x) == 0 for x in courses[course_id]["prereqs"]):
            courses[course_id]["prereqs"] = []


def lexographic(courses):
    seen = set()
    batch = list()
    for course_id in courses:
        if len(courses[course_id]["prereqs"]) == 0:
            batch.append(course_id)
            courses[course_id]["lexographic"] = 0
    i = 0
    while len(batch) > 0:
        i += 1
        seen.update(batch)
        batch = list()
        for course_id in courses:
            if course_id not in seen and all(all(x in seen for x in subreq) for subreq in courses[course_id]["prereqs"]):
                courses[course_id]["lexographic"] = i
                batch.append(course_id)


def validate_prereqs(courses):
    for course_id in courses:
        for prereq in courses[course_id]["prereqs"]:
            for pre_id in prereq:
                if pre_id not in courses:
                    print("Unknown prereq %s in %s" % (pre_id, course_id))
    print("Checked all prereqs.")


if __name__ == "__main__":
    with open(SOURCE, 'r') as file:
        courses = json.load(file)
    fix_names(courses)
    # remove_labs(courses)
    # remove_coreqs(courses)
    # resolve_prereqs(courses)
    # correct_prereqs(courses)
    # print(*list_categories(courses), sep="\n")
    # set_ap(courses)
    # add_summer_and_online(courses)
    # set_empty_prereqs(courses)
    # lexographic(courses)
    validate_prereqs(courses)
    with open(SOURCE, 'w') as file:
        file.write(json.dumps(courses, indent=4, sort_keys=True))