function onUpdate() {
    grad = {
        "math": 0,
        "history": 0,
        "lang": 0,
        "lang2": 0,
        "pe": 0,
        "econ": 0,
        "rs1": 1, // RS1 starts out "yes", and gets set to "no" later
        "cs": 0
    }

    var ms_courses = new Set();

    // Add things from previous years
    let math_courses = parseInt($("#ms-math").val()); // ? Does Algebra 1 correspond to TJ Math 1? If it does, we'd have to change the value in the HTML
    for (var i = 0; i<math_courses; i++) {
        ms_courses.add(MATHS[i]+"");
    }
    let language = $("#ms-lang").val();
    if (language !== "none") {
        $("#ms-lang-level").prop("disabled", false);
        var level = parseInt($("#ms-lang-level").val());
        for(var i = 0; i<level; i++){
            ms_courses.add(LANGUAGE[language][i]+"");
        }
    }
    else{
        $("#ms-lang-level").prop("disabled", true);
        $("#ms-lang-level").val("0");
    }
    if ($("#ms-epf-yes").is(":checked")) {
        ms_courses.add(SELF_EPF);
    }

    var current_courses = readCourses();

    // Check all the boxes
    var status = validate(current_courses, ms_courses);

    // Now display it
    showStatus(status.validity, current_courses);
    showGradState(status.grad);
    showLabStats(status.labs);

    // Sort the labs
    sortLabs()

    // Update the save thing
    saveToBox();
    exportSummary();
}

function readCourses() {
    var result = [];
    for(var i = 0; i<4; i++){
        var column = [];
        for(var j = 0; j<9; j++){
            column.push(readBox($("#" + getBoxId(j, i+1))));
        }
        result.push(column);
    }
    return result;
}

function setCourses(course_list) {
    for(var i = 0; i<4; i++){
        for(var j = 0; j<8; j++){
            let contents = course_list[i][j];
            let $box = $("#" + getBoxId(j, i+1));
            $box.find(".course").not("#lab_placeholder").remove();
            for(var k = 0; k<contents.length; k++) {
                $box.append(createCourseDraggable(courses[contents[k]]));
            }
        }
    }
}

function readBox($box) {
    var result = [];
    $box.find(".course").each(function(){
        let id = $(this).attr("data-course-id");
        if(id){
            result.push(id);
        }
    });
    return result;
}

function showStatus(validity, current_courses) {
    var location = {
        year: 0,
        index: 0
    };
    for(location.year = 0; location.year<4; location.year++){
        updateBox($("#" + getBoxId("s", location.year+1)), current_courses[location.year][0], validity[location.year][0], location);
        for(location.index = 1; location.index<8; location.index++){
            updateBox($("#" + getBoxId(location.index, location.year+1)), current_courses[location.year][location.index], validity[location.year][location.index], location);
        }
    }
}

function updateBox($box, box_courses, results, location) {
    var to_update = $box.find(".course").not("#lab_placeholder");
    for(var i = 0; i<to_update.length; i++){
        updateCourse(to_update[i].id, box_courses[i], results[i], location);
    }
}

function updateCourse(id, course_id, result, location) {
    course = courses[course_id];
    if (result.length === 0) {
        if (!course.availability[location.year]) {
            updateStatus(id, ICONS.CONDITIONAL, `This course is not typically taken in ${location.year+9}th grade, but this isn't a hard rule.`);
        } else {
            updateStatus(id, ICONS.SUCCESS, "Prerequisites are met.");
        }
    } else if (course.skiptest) {
        updateStatus(id, ICONS.TEST, "This course can be taken if you pass the skip test.");
    } else if (course.approval) {
        updateStatus(id, ICONS.APPROVE, "This course can be taken with teacher approval.");
    } else {
        let set = new Set();
        for (var i in result) {
            for (var j in result[i]) {
                set.add(result[i][j]);
            }
        }
        updateStatus(id, ICONS.FAILURE, "Prerequisites not met:\n" + treeToString(result) + "\nClick to view prerequisites", reqFilter(set));
    }
}

function updateStatus(target_id, icon, text, clickFilter = null) {
    $("#" + target_id).find("span").html("<abbr title=\"" + text + "\" style=\"color:" + icon[1] + ";\"><i class=\"" + icon[0] + "\"></i></abbr>");
    if (clickFilter) {
        $("#" + target_id).find("span").click(function () {
            filter(clickFilter);
        });
    }
}

function treeToString(x) {
    if (x.length == 0) {
        return "None";
    }

    result = [];
    for (i in x) {
        for (j in x[i]) {
            result.push(" - " + getCourseNameString(courses[x[i][j]]));
        }
        if (i < x.length - 1) {
            result.push("or");
        }
    }

    return result.join("\n");
}

function showLabStats(labs) {
    for (var lab_id in labs) {
        var entry = $("#labs__"+lab_id);
        var status = entry.find(".labs__status");
        switch(labs[lab_id]) {
            case 2:
                entry.removeClass("table-success table-default");
                entry.addClass("table-primary");
                status.text("Recommended");
                break;
            case 1:
                entry.removeClass("table-primary table-default");
                entry.addClass("table-success");
                status.text("Qualified");
                break;
            case 0:
                entry.removeClass("table-primary table-success");
                entry.addClass("table-default");
                status.text("Unqualified");
                break;
        }
    }
}