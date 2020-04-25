import json
import os
import pickle

SOURCE = "courses_cleaned.json"
LABS = "labs.json"
DESTINATION = "courses_by_id.json"
LABS_DESTINATION = "labs_by_id.json"
ALIAS_CACHE = "alias.pkl"


def main():
    with open(SOURCE, 'r', encoding="utf-8") as data_file:
        data = json.load(data_file)
    depends = dict()
    names = set(course["short_name"] for course in data)
    alias = dict()
    if os.path.exists(ALIAS_CACHE):
        with open(ALIAS_CACHE, 'rb') as cache_file:
            cache = pickle.load(cache_file)
            if input("Found existing alias dict: %s\nUse this? (y/n) " % (cache,)) == "y":
                alias = cache
    id_map = dict()
    for course in data:
        if course["short_name"] not in id_map:
            id_map[course["short_name"]] = list()
        id_map[course["short_name"]].append(course["id"])
    for course in data:
        if len(course["prerequisites"]) == 0:
            del course["prerequisites"]
        else:
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
        if course["weight"] > 0.6:  # I'm not sure about precision so let's use >0.6 instead of >0.5
            if course["full_name"].startswith("AP"):
                course["ap"] = "ap"
            else:
                course["ap"] = "post"
        else:
            course["ap"] = "pre"
    with open(ALIAS_CACHE, 'wb') as cache_file:
        pickle.dump(alias, cache_file)
    result = dict()
    for course in data:
        if course["id"] in depends:
            course["dependents"] = depends[course["id"]]
        if course["id"] in result:
            print("CONFLICTING COURSE ID: %s" % (course["id"],))
        result[course["id"]] = course
    with open(DESTINATION, 'w', encoding="utf-8") as output_file:
        output_file.write(json.dumps(result, indent=4))
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
