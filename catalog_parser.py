import re

# Parser modified and HTML data taken with permission from Matthew Cox, Sarah Gold, and Youn Qi's Planner project
# https://github.com/matthewjcox/scheduler/blob/ef74ab89a032428e71ec5a6bd2f57a28d79a6b79/private/update%20course%20catalog
OUTPUT = "courses.txt"
CLEANED_HTML = "course_catalog_html_cleaned.txt"
CATALOG_HTML = "course_catalog_html.txt"

file = open(CATALOG_HTML, "r", encoding='utf-8')
tempfile = open(CLEANED_HTML, "w", encoding='utf-8')
temp = re.sub(r'<.*?>', "", file.read())
temp = re.sub(u"([‘’])", "'", temp)
tempfile.write(re.sub(r'&amp;', "&", temp))

file.close()
tempfile.close()

file = open(CLEANED_HTML, "r", encoding='utf-8')
newFile = open(OUTPUT, "w", encoding='utf-8')
courses = {}
x = 0
y = 0
curCategory = None
curCourse = None
for line in file.read().splitlines():
    if re.match(r'\t{2}[^\t]', line):
        curCategory = line[2:]
    if re.match(r'\t{5}[^\t]', line) and not re.search('Frequently Asked Questions', line):
        x += 1
        # newFile.write(line[5:])
        # newFile.write("\n")
        if x == 1:
            curCourse = line[5:]  # full name
            courses[curCourse] = [curCategory] + [curCourse] + ["" for x in range(
                5)]  # category, full name, name, id, semester, honors, description
        elif x == 2:
            courses[curCourse][3] = line[5:]  # id
        elif x == 3:
            courses[curCourse][4] = line[5:]  # semester
        elif x == 4:
            courses[curCourse][5] = line[5:]  # honors
        elif x == 5:
            courses[curCourse][2] = line[5:]  # short name
        if x >= 6:
            x = 0
            y = 1

    if re.match(r'\t{6}[^\t]', line) and y:
        if re.search('PDF /', line):
            y = 0
            print(courses[curCourse])
            # newFile.write("\n")
            continue
        courses[curCourse][6] += line[6:]
for course in courses.keys():
    newFile.write("| ".join(courses[course]))
    newFile.write("\n")
# '''
