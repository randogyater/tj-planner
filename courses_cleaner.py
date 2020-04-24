import json

SOURCE = "courses.json"
DESTINATION = "courses_cleaned.json"
LABS_DESTINATION = "labs.json"


def main():
    with open(SOURCE, 'r', encoding="utf-8") as data_file:
        data = json.load(data_file)
    result = list()
    labs = list()
    depends = dict()
    names = set()
    for course in data:
        if course["administrative"]:
            continue
        else:
            del course["administrative"]
            names.add(course["short_name"])
            if course["category"] == "Senior Research":
                del course["availability"]
                del course["weight"]
                del course["semester"]
                labs.append(course)
            else:
                for prereq_set in course["prerequisites"]:
                    for prereq in prereq_set:
                        if prereq not in depends:
                            depends[prereq] = list()
                        depends[prereq].append(course["short_name"])
                result.append(course)
    alias = dict()
    for name in depends:
        if name not in names:
            new_name = input("Class \"%s\" not found; enter alias: " % (name,))
            while new_name != "" and new_name not in names:
                new_name = input("Class \"%s\" not found; try again? " % (new_name,))
            if new_name != "":
                alias[name] = new_name
    for name in alias:
        depends[alias[name]] = depends[name]
    for course in result:
        course["dependents"] = depends[course["short_name"]] if course["short_name"] in depends else list()
    with open(DESTINATION, 'w', encoding="utf-8") as target_file:
        target_file.write(json.dumps(result, indent=4))
    with open(LABS_DESTINATION, 'w', encoding="utf-8") as target_file:
        target_file.write(json.dumps(labs, indent=4))


if __name__ == "__main__":
    main()
