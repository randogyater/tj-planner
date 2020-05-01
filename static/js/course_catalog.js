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
