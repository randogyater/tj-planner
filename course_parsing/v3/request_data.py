import requests


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
    # print(course_data)
    course = dict()
    course["full_name"] = course_data["CourseName"]
    if course_data["Flag_OnlineCourse"] == 0:
        course["category"] = category
    else:
        course["category"] = "Online"
    course["prereq_string"] = course_data["Prerequisite"]
    course["coreq_string"] = course_data["Corequisite"]
    course["id"] = course_data["CourseNum"]
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
    print(get_course(11248, "N/A"))
