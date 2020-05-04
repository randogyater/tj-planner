import json
import os
import pickle

TJ_DESC_PREAMBLE = "\nTJ: "

UNIQUE_STATEMENT = "This course is unique to TJHSST and is not available in other FCPS schools."

SOURCE = "courses_cleaned.json"
LABS = "labs_raw.json"
DESTINATION = "courses_raw.json"
LABS_DESTINATION = "labs_raw.json"
ALIAS_CACHE = "alias.pkl"


def main():
    # Read data
    with open(SOURCE, 'r', encoding="utf-8") as data_file:
        data = json.load(data_file)
    names = set(course["short_name"] for course in data)

    # Grab alias from cache if possible
    alias = dict()
    if os.path.exists(ALIAS_CACHE):
        with open(ALIAS_CACHE, 'rb') as cache_file:
            cache = pickle.load(cache_file)
            if input("Found existing alias dict: %s\nUse this? (y/n) " % (cache,)) == "y":
                alias = cache

    # Build ID map, processing summer and online as alternatives
    id_map = dict()
    index_map = dict()
    summer = list()
    online = list()
    for i, course in enumerate(data):
        # Set default tags
        course["online"] = False
        course["equivalent"] = course["id"]
        course["unique"] = False

        index_map[course["short_name"]] = i

        if course["category"] == "Summer School":
            summer.append(course)
            continue
        if course["category"] == "Online":
            online.append(course)
            continue
        if course["short_name"] not in id_map:
            id_map[course["short_name"]] = list()
        id_map[course["short_name"]].append(course["id"])
    for course in summer:
        if course["short_name"] not in id_map:
            id_map[course["short_name"]] = [course["id"]]
        else:
            course["equivalent"] = id_map[course["short_name"]][0]  # Note that this summer course is equal
    duplicate_online = list()
    for course in online:
        if course["short_name"] not in id_map:
            id_map[course["short_name"]] = [course["id"]]
        else:
            duplicate_online.append(course["id"])
            data[index_map[course["short_name"]]]["online"] = True  # Note that an online option exists
    # Go through all courses
    depends = dict()
    for course in data:
        # Remove prerequisites if they do not exist
        if len(course["prerequisites"]) == 0 or len(course["prerequisites"][0]) == 0:
            del course["prerequisites"]
        else:
            # Shift prereqs to using id
            new_prereqs = list()
            for prereq_set in course["prerequisites"]:
                new_set = list()
                for prereq in prereq_set:
                    new_prereq = None
                    if prereq in names:
                        new_prereq = prereq
                    elif prereq in alias:
                        new_prereq = alias[prereq]
                    else:
                        new_name = input("Course \"%s\" not found; enter alias: " % (prereq,))
                        while new_name != "" and new_name not in names:
                            new_name = input("Course \"%s\" not found; try again? " % (new_name,))
                        if new_name != "":
                            alias[prereq] = new_name
                            new_prereq = new_name
                    if new_prereq is not None:
                        new_prereq = id_map[new_prereq][0]
                        new_set.append(new_prereq)
                        if new_prereq not in depends:
                            depends[new_prereq] = list()
                        depends[new_prereq].append(course["id"])
                new_prereqs.append(new_set)
            course["prerequisites"] = new_prereqs

        # Record AP status
        if course["weight"] > 0.6:  # I'm not sure about precision so let's use >0.6 instead of >0.5
            if course["full_name"].startswith("AP"):
                course["ap"] = "ap"
            else:
                course["ap"] = "post"
        else:
            course["ap"] = "pre"

    # Dump the alias cache
    with open(ALIAS_CACHE, 'wb') as cache_file:
        pickle.dump(alias, cache_file)

    # Change everything to using ID
    result = dict()
    for course in data:
        if course["id"] in depends:
            course["dependents"] = depends[course["id"]]
        if course["id"] in result:
            print("CONFLICTING COURSE ID: %s" % (course["id"],))
        result[course["id"]] = course

    # Delete the online courses that have duplicates
    for i in duplicate_online:
        del result[i]

    # Clean up descriptions a bit

    for i in result:
        if result[i]["description"] == "None" \
                or result[i]["description"] == UNIQUE_STATEMENT:
            if result[i]["description"] == UNIQUE_STATEMENT:
                result[i]["unique"] = True
            if "tj_description" in result[i]:
                result[i]["description"] = result[i]["tj_description"]
                del result[i]["tj_description"]
            else:
                result[i]["description"] = "None"  # Admit defeat, I guess
        else:
            if "tj_description" in result[i]:
                result[i]["description"] += TJ_DESC_PREAMBLE + result[i]["tj_description"]
                del result[i]["tj_description"]

    # Write courses
    with open(DESTINATION, 'w', encoding="utf-8") as output_file:
        output_file.write(json.dumps(result, indent=4))
    # Do the same thing to labs
    with open(LABS, 'r', encoding="utf-8") as labs_file:
        labs = json.load(labs_file)
    labs_by_id = dict()
    for lab in labs:
        del lab["description"]  # Only the TJ description is meaningful
        lab["description"] = lab["tj_description"]
        del lab["tj_description"]
        new_prereqs = list()
        for prereq_set in lab["prerequisites"]:
            new_set = list()
            for prereq in prereq_set:
                new_prereq = None
                if prereq in names:
                    new_prereq = prereq
                elif prereq in alias:
                    new_prereq = alias[prereq]
                else:
                    new_name = input("Course \"%s\" not found; enter alias: " % (prereq,))
                    while new_name != "" and new_name not in names:
                        new_name = input("Course \"%s\" not found; try again? " % (new_name,))
                    if new_name != "":
                        alias[prereq] = new_name
                        new_prereq = new_name
                if new_prereq is not None:
                    new_prereq = id_map[new_prereq][0]
                    new_set.append(new_prereq)
            new_prereqs.append(new_set)
        lab["prerequisites"] = new_prereqs
        labs_by_id[lab["id"]] = lab
    with open(LABS_DESTINATION, 'w', encoding="utf-8") as output_file:
        output_file.write((json.dumps(labs_by_id, indent=4)))
    with open("conflicts.txt", 'w', encoding="utf-8") as file:
        for key in id_map:
            if len(id_map[key]) > 1:
                file.write("CONFLICT: %s --> %s\n" % (key, id_map[key]))


if __name__ == "__main__":
    main()
