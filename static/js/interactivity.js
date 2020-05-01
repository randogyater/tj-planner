function allowDrop(event) {
    if(event.target.childElementCount<=1) {
        event.preventDefault();
    }
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var id = event.dataTransfer.getData("text");
    if(validTarget(event)){
        if(id.startsWith("c")){
            event.target.appendChild(document.getElementById(id));
        }
        else {
            $(event.target).append(createCourseDraggable($("#"+id).attr("data-course-id")))
        }
    }
}

function toss(event) {
    var id = event.dataTransfer.getData("text");
    if(id.startsWith("c")) {
        event.preventDefault();
        $("#"+id).remove();
    }
}

function validTarget(event) {
    if(!event.target.getAttribute("class").includes("grid__box")){
        return false;
    }
    else if(event.target.childElementCount == 0) {
        return true;
    }
    else if (event.target.childElementCount == 1 && event.target.firstElementChild.getAttribute("class").includes("course--semester")){
        var id = event.dataTransfer.getData("text");
        if (id == "") {
            return true;
        }
        else if (id.startsWith("c")) {
            return $("#"+event.dataTransfer.getData("text")).attr("class").includes("course--semester");
        }
        else {
            return courses[$("#"+id).attr("data-course-id")].semester;
        }
    }
}

function checkRequirements(course_id, past, other_sem) {
    course = courses[course_id];
    if (!('prerequisites' in course)) {
        // No prerequisites? Let it go.
        return {state: true};
    }

    let result = {state: false, skippable: false, unmet: []};
    for(var i = 0; i<course.prerequisites.length; i++) {
        // Check every set for matching
        let unmet = [];
        let match = true;
        let skip_match = true;
        for(var j = 0; j<course.prerequisites[i].length; j++) {
            if (!(past.has(course.prerequisites[i][j]) || course.prerequisites[i][j] == other_sem)) {
                match = false;
                unmet.push(course.prerequisites[i][j]);
                if(!courses[course.prerequisites[i][j]].skippable) {
                    skip_match = false;
                }
            }
        }
        result.unmet.push(unmet);
        if (match) {
            result.state = true;
        }
        if (skip_match) {
            result.skippable = true;
        }
    }

    return result;
}
