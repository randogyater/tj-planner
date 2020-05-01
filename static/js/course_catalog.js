$.getJSON("static/data/courses.json", function(data) {
    courses=data;
    showEntries(id => true);
    $.getJSON("static/data/default_schedule.json", function(defaults) {
        for (let i = 0; i<defaults.length; i++) {
            let item = defaults[i];
            $("#"+getBoxId(item.row, item.col)).append(createCourseDraggable(item.course));
        }
        validateSchedule()
    });
});
$.getJSON("static/data/labs.json", function(data) {labs=data});

function getCourseNameString(id) {
    return "("+id+") "+courses[id].full_name;
}

function getBoxId(r, c) {
    return "cell-"+r+"-"+c;
}

counter = 0;
function createCourseDraggable(course_id) {
    course = courses[course_id];
    counter++;
    var $course = $("<div>", {
        id: "c"+counter,
        "class": "course",
        "draggable":"true",
        "ondragstart":"dragStart(event)",
        "data-course-id":course_id,
        "data-course-credit":course.equivalent
    });
    $course.append("<span class=\"course__status\"><abbr title=\"Loading prerequisites\"><i class=\"fas fa-spinner\"></i></abbr></span>");
    $course.append(course.short_name);
    if(course.semester) {
        $course.addClass("course--semester");
    }
    else {
        $course.addClass("course--year");
    }
    if(course.ap === "ap") {
        $course.addClass("course--ap");
    }
    if(course.ap === "post") {
        $course.addClass("course--post-ap");
    }
    return $course;
}

function createCourseEntry(course_id) {
    course = courses[course_id];
    var $course = $("<div>", {
        id: "entry-"+course_id,
        "class": "catalog__entry",
        "draggable":"true",
        "ondragstart":"dragStart(event)",
        "data-course-id":course_id,
    });
    if(course.ap === "ap") {
        $course.addClass("course--ap");
    }
    if(course.ap === "post") {
        $course.addClass("course--post-ap");
    }
    $properties = $("<span class=\"course__properties\"></span>")
    if(course.category === "Summer School") {
        $properties.append(" <abbr title=\"This is a summer course replacing " + getCourseNameString(course.equivalent) + "\"><i class=\"fas fa-sun\"></i></abbr>");
    }
    if(course.skippable) {
        $properties.append(" <abbr title=\"You can take a test to skip this course!\"><i class=\"fas fa-running\"></i></abbr>");
    }
    if(course.unique) {
        $properties.append(" <abbr title=\"This course is unique to TJ and not offered elsewhere in FCPS.\"><i class=\"fas fa-asterisk\"></i></abbr>");
    }
    if(course.online) {
        $properties.append(" <abbr title=\"This course can be taken online.\"><i class=\"fas fa-desktop\"></i></abbr>");
    }
    if(course.category === "Online") {
        $properties.append(" <abbr title=\"This is an online-only course.\"><i class=\"fas fa-wifi\"></i></abbr>");
    }
    if(course.semester) {
        $properties.append(" <span title=\"This is a semester course and will last half a year.\">½</abbr>");
    }
    $course.append($properties);
    $course.append(course.full_name);
    return $course;
}

function showEntries(condition) {
    var catalog = $("#catalog");
    for (course in courses) {
        if(condition(course.id)){
            catalog.append(createCourseEntry(course));
        }
    }
};
