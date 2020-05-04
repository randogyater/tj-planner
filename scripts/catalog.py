import json

COURSE_FILE = "static/data/courses.json"

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

def apply_replacements(map):
    """Maps replacements onto the JSON file

    Arguments:
        map {dict} -- A mapping of before to after replacements
    """
    with open(COURSE_FILE, 'r') as file:
        data = json.load(file)
    for entry in map:
        # Applying top-level modification
        data[map[entry]] = data[map]
    for id in data:
        entry = data[id]
        if[entry["id"]] in map:
            entry["id"] = map[entry["id"]]
        if[entry["equivalent"]] in map:
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
    with open(COURSE_FILE, 'w') as file:
        file.write(json.dumps(data, indent=4))


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