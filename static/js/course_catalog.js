$.getJSON("static/data/courses.json", function(data) {courses=data});
$.getJSON("static/data/labs.json", function(data) {labs=data});
counter = 0;

function createCourseDraggable(course_id) {
    course = courses[course_id];
    var $course = $("<div>", {id: "c"+counter, "class": "course", "draggable":"true", "ondragstart":"drag(event)"});
    if(course.semester) {
        $course.addClass("course--semester");
    }
    else {
        $course.addClass("course--year");
    }
    return $course;
}