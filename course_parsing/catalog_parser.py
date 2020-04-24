import json
import re

# Parser modified and HTML data taken with permission from Matthew Cox, Sarah Gold, and Youn Qi's Scheduler project
# https://github.com/matthewjcox/scheduler/blob/ef74ab89a032428e71ec5a6bd2f57a28d79a6b79/private/update%20course%20catalog
OUTPUT = "courses.json"
CLEANED_HTML = "course_catalog_html_cleaned.txt"
CATALOG_HTML = "course_catalog_html.txt"

file = open(CATALOG_HTML, "r", encoding='utf-8')
cleaned_file = open(CLEANED_HTML, "w", encoding='utf-8')
temp = re.sub(r'<.*?>', "", file.read())
temp = re.sub(u"([‘’])", "'", temp)
cleaned_file.write(re.sub(r'&amp;', "&", temp))

file.close()
cleaned_file.close()

file = open(CLEANED_HTML, "r", encoding='utf-8')
courses = list()
x = 0
y = 0
cur_category = None
course = None
prereqs = False
for line in file.read().splitlines():
    if re.match(r'\t{2}[^\t]', line):
        cur_category = line[2:]
    if re.match(r'\t{5}[^\t]', line) and not re.search('Frequently Asked Questions', line):
        x += 1
        if x == 1:
            course = dict()
            course["full_name"] = line[5:]  # full name
            course["category"] = cur_category
            course["administrative"] = True if cur_category == "Administrative" else False
            course["prerequisites"] = [list()]
        elif x == 2:
            course["id"] = line[5:]  # id
        elif x == 3:
            course["semester"] = line[5:] == "0.5"  # is it a semester course
            if line[5:] != "0.5" and line[5:] != "1.0":
                # A course without a length marking or with a length marking over 1 is an administrative
                course["administrative"] = True
        elif x == 4:
            course["weight"] = float(line[5:])  # honors weighting
        elif x == 5:
            course["short_name"] = line[5:]  # short name
        elif x == 6:
            availability = {
                9: False,
                10: False,
                11: False,
                12: False
            }
            for grade in line[5:].split(","):
                availability[int(grade)] = True
            course["availability"] = availability
        if x >= 6:
            x = 0
            y = 1
    if prereqs and re.match(r'\t{9}[^\t]', line):
        course["prerequisites"][-1].append(re.sub(r' and |(,$)', "", line[9:]))
    if prereqs and re.match(r'\t{8}[^\t]', line) and line[8:] == " or ":
        course["prerequisites"].append(list())
    if re.match(r'\t{6}[^\t]', line) and y:
        if re.search('PDF /', line):
            y = 0
            # print(curCourse)
            courses.append(course)
            prereqs = False
            continue
        if line[6:] == "Prerequisites":
            prereqs = True
        if line[6:].startswith("TJHSST Description"):
            course["tj_description"] = line[24:]
        if line[6:].startswith("Description"):
            course["description"] = line[17:]
with open(OUTPUT, "w", encoding='utf-8') as output:
    output.write(json.dumps(courses, indent=4))
# '''
