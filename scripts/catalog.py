import json

COURSE_FILE = "static/data/courses.json"
UPDATE_FILE = "course_parsing/v2/catalog.txt"

def read():
    with open(COURSE_FILE, 'r') as file:
        return(json.load(file))

def write(data):
    with open(COURSE_FILE, 'w') as file:
        file.write(json.dumps(data, indent=4))

def back_map():
    """Gets a mapping of names (full and short) to ID

    Returns:
        dict -- Maps names to ID
    """
    map = dict()
    with open(COURSE_FILE, 'r') as file:
        data = json.load(file)
    for id in data:
        map[data[id]["full_name"].upper()] = id
        map[data[id]["short_name"].upper()] = id
    return map

def apply_replacements(map, data = None):
    """Maps replacements onto the JSON file

    Arguments:
        map {dict} -- A mapping of before to after replacements
    """
    writeout = False
    if data is None:
        writeout = True
        data = read()
    for entry in map:
        # Applying top-level modification
        data[map[entry]] = data[entry]
    for id in data:
        entry = data[id]
        if entry["id"] in map:
            entry["id"] = map[entry["id"]]
        if entry["equivalent"] in map:
            entry["equivalent"] = map[entry["equivalent"]]
        if "prerequisites" in entry:
            for option in entry["prerequisites"]:
                for i in range(len(option)):
                    if option[i] in map:
                        option[i] = map[option[i]]
        if "dependents" in entry:
            dependents = entry["dependents"]
            for i in range(len(dependents)):
                if dependents[i] in map:
                    dependents[i] = map[dependents[i]]
    if writeout:
        write(data)


def validate_replacements(map):
    """Checks whether a replacement map works

    Arguments:
        map {dict} -- The map to check

    Returns:
        (set, set) -- Existing IDs displaced by the mapping, and IDs mapped to by more than one entry
    """
    conflicts = set()
    displaced = set()
    seen = set()
    with open(COURSE_FILE, 'r') as file:
        data = json.load(file)
    for entry in map:
        if map[entry] in seen:
            conflicts.add(map[entry])
        else:
            seen.add(map[entry])
        if map[entry] in data and map[entry] not in map:
            displaced.add(map[entry])
    return displaced, conflicts


def title_case(string):
    return " ".join(word.capitalize() for word in string.split(" "))


def main():
    data = read()
    name_to_id = back_map()
    replacements = dict()
    lines = list()
    with open(UPDATE_FILE, 'r') as file:
        for line in file.readlines():
            name, course_id, avail_string = tuple(line.strip().split(" | "))
            name = name.upper()
            years = [int(x) for x in avail_string.split(" ")]
            availability = [i in years for i in range(9,13)]
            lines.append((name, course_id, availability))
    
    for name, id, availability in lines:
        if "W/" in name or name[-3:] == "RES":
            continue
        current_name = data[id]["short_name"].upper() if id in data else None
        current_id = name_to_id[name] if name in name_to_id else None
        if current_name == name:
            # Good!
            if data[id]["availability"] != availability:
                data[id]["availability"] = availability
                print("Updated availability for", name)
        elif (current_name is None and current_id is None):
            print("TODO: Create new course (%s) %s" % (id, name))
        elif current_name is None:
            # The name already has an ID
            print("%s is bound to ID %s, replacing with %s." % (name, current_id, id))
            replacements[current_id] = id
        elif current_id is None:
            print("TODO: %s has name %s. Rename to %s?" % (id, current_name, name))
        else:
            print("TODO: Create course (%s) %s, resolve conflict between (%s) %s and (%s) %s" % (id, name, current_id, name, id, current_name))
    
    apply_replacements(replacements, data)
    write(data)


if __name__ == "__main__":
    main()