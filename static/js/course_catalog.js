$.getJSON("static/data/courses.json", function(data) {
    courses=data;
    showEntries(id => true);
    $.getJSON("static/data/default_schedule.json", function(defaults) {
        for (let i = 0; i<defaults.length; i++) {
            let item = defaults[i];
            $("#cell-"+item.row+"-"+item.col).append(createCourseDraggable(item.course));
        }
    });
});
$.getJSON("static/data/labs.json", function(data) {labs=data});


counter = 0;

function createCourseDraggable(course_id) {
    course = courses[course_id];
    counter++;
    var $course = $("<div>", {
        id: "c"+counter,
        "class": "course",
        "draggable":"true",
        "ondragstart":"drag(event)",
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
        "ondragstart":"drag(event)",
        "data-course-id":course_id,
    });
    $course.text(course.full_name);
    if(course.ap === "ap") {
        $course.addClass("course--ap");
    }
    if(course.ap === "post") {
        $course.addClass("course--post-ap");
    }
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
