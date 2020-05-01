$.getJSON("static/data/courses.json", function(data) {courses=data; showEntries()});
$.getJSON("static/data/labs.json", function(data) {labs=data});
counter = 0;

function getCourseNameString(id) {
    return "("+id+") "+courses[id].full_name;
}

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
    $course.text(course.short_name);
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
    $course.text(course.full_name);
    if(course.ap === "ap") {
        $course.addClass("course--ap");
    }
    if(course.ap === "post") {
        $course.addClass("course--post-ap");
    }
    if(course.category === "Summer School") {
        $course.append(" <abbr title=\"This is a summer course replacing " + getCourseNameString(course.equivalent) + "\"><i class=\"fas fa-sun\"></i></abbr>");
    }
    if(course.semester) {
        $course.append(" <abbr title=\"This is a semester course and will last half a year.\"><i class=\"fas fa-hourglass-start\"></i></abbr>");
    }
    if(course.online) {
        $course.append(" <abbr title=\"This course can be taken online.\"><i class=\"fas fa-desktop\"></i></abbr>");
    }
    return $course;
}

function showEntries() {
    var catalog = $("#catalog");
    for (course in courses) {
        catalog.append(createCourseEntry(course));
    }
};
