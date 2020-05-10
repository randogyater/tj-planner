const ICONS = {
    SUCCESS: "fas fa-check-circle",
    FAILURE:  "fas fa-times-circle",
    CONDITIONAL:  "fas fa-exclamation-circle",
    ADDITIONAL:  "fas fa-plus-circle",
    LOADING:  "fas fa-spinner"
};

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

        validateSchedule();
    }
}

function toss(event) {
    var id = event.dataTransfer.getData("text");
    if(id.startsWith("c")) {
        event.preventDefault();

        $("#"+id).remove();
        
        validateSchedule();
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

function validateSchedule() {
    previous = new Set();
    for(var c = 1; c<=4; c++) {
        updateBox($("#"+getBoxId("s", c)), previous, c-1);

        $("#"+getBoxId("s", c)).children().each(function(i){previous.add($(this).attr("data-course-credit"));});

        for(var r = 1; r<=7; r++){
            updateBox($("#"+getBoxId(r, c)), previous, c-1);
        }

        for(var r = 1; r<=7; r++){
            $("#"+getBoxId(r, c)).children().each(function(i){previous.add($(this).attr("data-course-credit"));});
        }
    }
}

function updateBox($box, past, year) {
    $children = $box.children(".course");

    if($children.length == 1){
        updateElement($children[0].id, past, null, year);
    }
    else if ($children.length == 2) {
        updateElement($children[0].id, past, $children[1].getAttribute("data-course-id"), year);
        updateElement($children[1].id, past, $children[0].getAttribute("data-course-id"), year);
    }
}

function updateElement(id, past, other_sem, year) {
    $course = $("#"+id);
    course = courses[id];

    result = checkRequirements($course.attr("data-course-id"), past, other_sem);
    if(result.state) {
        if(!course.availability[year]) {
            updateStatus(id, ICONS.CONDITIONAL, `This course is not offered in ${year}th grade, but this isn't a hard rule.`);
        }
        else {
            updateStatus(id, ICONS.SUCCESS, "Prerequisites are met.");
        }
    }
    else if(result.skippable) {
        updateStatus(id, ICONS.CONDITIONAL, "This course can be taken if you test out of the following classes:\n - "+result.skips.join("\n - "));
    }
    else{
        let set = new Set();
        for(i in result.unmet) {
            for(j in result.unmet[i]) {
                set.add(result.unmet[i][j]);
            }
        }
        updateStatus(id, ICONS.FAILURE, "Prerequisites not met:\n"+stringRequirements(result.unmet)+"\nClick to view prerequisites", reqFilter(set));
    }
}

function checkRequirements(course_id, past, other_sem) {
    course = courses[course_id];
    if (!('prerequisites' in course)) {
        // No prerequisites? Let it go.
        return {state: true};
    }

    let result = {state: false, skippable: false, unmet: [], skips: []};
    for(var i = 0; i<course.prerequisites.length; i++) {
        // Check every set for matching
        let unmet = [];
        let match = true;
        let skip_match = true;

        for(var j = 0; j<course.prerequisites[i].length; j++) {
            let prereq = course.prerequisites[i][j];
            if (!(past.has(prereq) || prereq == other_sem)) {
                match = false;
                unmet.push(prereq);
                if(courses[prereq].skippable) {
                    result.skips.push(prereq);
                }
                else {
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

function updateStatus(target, icon, text, clickFilter = null) {
    $("#"+target).find("span").html("<abbr title=\""+text+"\"><i class=\""+icon+"\"></i></abbr>");
    if(clickFilter) {
        $("#"+target).find("span").click(function(){
            filter(clickFilter);
        });
    }
}

function stringRequirements(x) {
    if(x.length==0){
        return " None";
    }
    
    result = [];
    for(i in x) {
        for(j in x[i]) {
            result.push(" - "+getCourseNameString(x[i][j]));
        }
        if(i<x.length-1){
            result.push("or");
        }
    }

    return result.join("\n");
}

function filter(condition) {
    $("#filter-status").text("Filtering...")
    let keep_category = new Set();
    let count = 0;
    let $entries = $(".catalog__entry");
    $entries.each(function(i) {
        $this = $(this); // Sometimes it just looks surreal
        let course = courses[$this.attr("data-course-id")]
        if(condition(course)) {
            keep_category.add("catalog__"+toID(course.category));
            count++;
            if($this.is(":hidden")){
                $this.show(0);
            }
        }
        if(!condition(course) && !$this.is(":hidden")) {
            $this.hide(0);
        }
    });
    $("#filter-status").text(`Showing ${count} of ${$entries.length}`);
    $(".catalog__category").each(function(i) {
        let $this = $(this);
        if(!keep_category.has($this.attr("id")) && $this.is(":visible")) {
            $this.hide(0);
        }
        if(keep_category.has($this.attr("id")) && $this.is(":hidden")) {
            $this.show(0);
        }
    });
}
