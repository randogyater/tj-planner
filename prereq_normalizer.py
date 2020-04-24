import json
import os
import pickle

SOURCE = "courses_cleaned.json"
DESTINATION = "courses_with_depend.json"
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
    for course in data:
        if len(course["prerequisites"]) == 0:
            del course["prerequisites"]
        else:
            new_prereqs = list()
            for prereq_set in course["prerequisites"]:
                new_set = list()
                for prereq in prereq_set:
                    if prereq in names:
                        new_set.append(prereq)
                    elif prereq in alias:
                        new_set.append(alias[prereq])
                    else:
                        new_name = input("Course \"%s\" not found; enter alias: " % (prereq,))
                        while new_name != "" and new_name not in names:
                            new_name = input("Course \"%s\" not found; try again? " % (new_name,))
                        if new_name != "":
                            alias[prereq] = new_name
                            new_set.append(new_name)
                        else:
                            new_set.append(prereq + "(?)")
                new_prereqs.append(new_set)
            course["prerequisites"] = new_prereqs
        if course["weight"] > 0.6: # I'm not sure about precision so use >0.6 instead of >0.5
            if course["full_name"].startswith("AP"):
                course["ap"] = "ap"
            else:
                course["ap"] = "post"
        else:
            course["ap"] = "pre"
    with open(ALIAS_CACHE, 'wb') as cache_file:
        pickle.dump(alias, cache_file)
    for course in data:
        for prereq_set in course["prerequisites"]:
            for prereq in prereq_set:
                if prereq not in depends:
                    depends[prereq] = list()
                depends[prereq].append(course["short_name"])
    for course in data:
        if course["short_name"] in depends:
            course["dependents"] = depends[course["short_name"]]
    with open(DESTINATION, 'w', encoding="utf-8") as output_file:
        output_file.write(json.dumps(data, indent=4))


if __name__ == "__main__":
    main()
