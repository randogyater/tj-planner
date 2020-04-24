import json

SOURCE = "courses.json"
DESTINATION = "courses_cleaned.json"
LABS_DESTINATION = "labs.json"


def main():
    with open(SOURCE, 'r', encoding="utf-8") as data_file:
        data = json.load(data_file)
    result = list()
    labs = list()
    for course in data:
        if course["administrative"]:
            continue
        else:
            del course["administrative"]
            if course["category"] == "Senior Research":
                del course["availability"]
                del course["weight"]
                del course["semester"]
                labs.append(course)
            else:
                result.append(course)
    with open(DESTINATION, 'w', encoding="utf-8") as target_file:
        target_file.write(json.dumps(result, indent=4))
    with open(LABS_DESTINATION, 'w', encoding="utf-8") as target_file:
        target_file.write(json.dumps(labs, indent=4))


if __name__ == "__main__":
    main()
