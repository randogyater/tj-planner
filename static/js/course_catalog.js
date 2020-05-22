$.getJSON("static/data/courses.json", function (data) {
    courses = data;
    $.getJSON("static/data/labs.json", function (data) {
        labs = data
        $.getJSON("static/data/default_schedule.json", function (defaults) {
            for (let i = 0; i < defaults.length; i++) {
                let item = defaults[i];
                $("#" + getBoxId(item.row, item.col)).append(createCourseDraggable(item.course));
            }

            onUpdate()
        });
    });
});

function kebab(string) {
    return string.toLowerCase().replace(/ /g, "_");
}

function getCourseNameString(id) {
    return "(" + id + ") " + courses[id].full_name;
}

function getBoxId(r, c) {
    return "cell-" + r + "-" + c;
}

counter = 0;

function createCourseDraggable(course_id) {
    course = courses[course_id];
    counter++;

    var $course = $("<div>", {
        id: "c" + counter,
        "class": "course",
        "draggable": "true",
        "ondragstart": "dragStart(event)",
        "data-course-id": course_id,
        "data-course-credit": course.equivalent
    });

    $course.append("<span class=\"course__status\"><abbr title=\"Loading prerequisites\"><i class=\"fas fa-spinner\"></i></abbr></span>");
    $course.append(course.short_name);

    if (course.semester) {
        $course.addClass("course--semester");
    } else {
        $course.addClass("course--year");
    }

    if (course.ap === "ap") {
        $course.addClass("course--ap");
    }
    else if (course.ap === "post") {
        $course.addClass("course--post-ap");
    }
    else {
        $course.addClass("course--pre-ap");
    }

    $course.addClass("course--"+kebab(course.category))

    return $course;
}
