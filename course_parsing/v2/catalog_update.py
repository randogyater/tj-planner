import sys
import os
sys.path.append(os.path.abspath("./scripts"))
import catalog #pylint: disable=import-error

if __name__ == "__main__":
    courses = list()
    data = catalog.read()
    back_map = catalog.back_map()
    replacements = dict()
    not_found = list()

    with open("course_parsing/v2/catalog.txt", 'r') as file:
        for line in file.readlines():
            name, course_id, avail_string = tuple(line.strip().split(" | "))
            years = [int(x) for x in avail_string.split(" ")]
            availability = [i in years for i in range(9,13)]
            courses.append((name, course_id, availability))
    
    for name, course_id, availability in courses:
        if name in back_map:
            if back_map[name] != course_id:
                replacements[back_map[name]] = course_id
        else:
            not_found.append((name, course_id))
    
    for name, course_id in not_found:
        if course_id in data:
            if input("{} not found, is it \"{}\"? (y/n) ".format(name, data[course_id]["full_name"])) == "y":
                data[course_id]["short_name"] = name
        else:
            print("{} not found".format(name))
    
    validation = catalog.validate_replacements(replacements)
    if validation == ([],[]):
        for key in replacements:
            print("{} -> {}".format(key, replacements[key]))
        catalog.apply_replacements(replacements)
    else:
        print("Displacements: {}, Conflicts: {}".format(*validation))
        exit()
    
    for name, course_id, availability in courses:
        if availability != data[course_id]["availability"]:
            print("Updated availability for {}".format(course_id))
            data[course_id]["availability"] = availability
    catalog.write(data)