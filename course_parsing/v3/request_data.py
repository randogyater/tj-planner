import requests
import json


OUTPUT = "course_parsing/v3/courses.json"


def get_course_list():
    r = requests.post("https://insys.fcps.edu/CourseCatOnline/server/services/CourseCatOnlineData.cfc"
                      "?method=getPanelMenuData",
                      json={"LocationID": "503",
                            "GradeA": "0",
                            "GradeB": "0",
                            "GradeC": "0",
                            "CourseMenuMainID": "reportPanelSideNav"})
    groups = r.json()["TDATA"]["stCourseList"]["CourseGroups"]
    courses = list()
    categories = list()
    for group in groups:
        for category in group["CourseGroup"]:
            category_name = category["CourseGroupNavShort"]
            for course in category["Courses"]:
                courses.append((course["Course_ID"], category_name))
            categories.append(category_name)
    return courses, categories


def get_course(course_id, category):
    r = requests.post("https://insys.fcps.edu/CourseCatOnline/server/services/CourseCatOnlineData.cfc"
                      "?method=getCourseDetail",
                      json={
                          "CachedPOS": "1",
                          "LocationID": "503",
                          "courseid": course_id,
                          "showbus": 0
                      })
    course_data = r.json()["TDATA"][0]
    course = dict()
    course["full_name"] = course_data["CourseName"]
    if course_data["Flag_OnlineCourse"] == 0:
        course["category"] = category
    else:
        course["category"] = "Online"
    course["prereq_string"] = course_data["Prerequisite"]
    course["coreq_string"] = course_data["Corequisite"]
    course["id"] = course_id
    course["num"] = course_data["CourseNum"]
    course["semester"] = not course_data["CourseDurationShort"] == "Year"
    if "weighted" not in course_data["CourseCredit"]:
        course["weight"] = 0
    elif course_data["CourseCreditShort"][-2:] == ".5":
        course["weight"] = 0.5
    else:
        course["weight"] = 1.0
    course["short_name"] = course_data["ShortCourseName"]
    course["availability"] = [course_data["Grade" + str(x)] == 1 for x in range(9, 13)]
    course["description"] = course_data["CourseDescription"]  # Tell me something I don't know...
    course["equivalent"] = course["id"]
    course["ap"] = course_data["Flag_AP"] == 1
    course["skippable"] = False
    return course


if __name__ == "__main__":
    courses = dict()
    course_list, categories = get_course_list()
    print("Got %s ids" % (len(course_list)))
    for i, entry in enumerate(course_list):
        print("Requesting {} ({:.2%})".format(entry[0], i/len(course_list)))
        course = get_course(*entry)
        courses[course["id"]] = course
    with open(OUTPUT, 'w') as file:
        file.write(json.dumps(courses, indent=4))
    print("Done!")
    print("Categories found:", "\n".join(categories), sep="\n")
