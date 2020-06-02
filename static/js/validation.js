function onUpdate() {
    previous = new Set();
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

    state = {
        past: previous,
        year: 0,
        grad: grad,
        index: 0,
        rs_time: 0, // This is actually 2 + the current year * 2, minus 1 if it was in summer
        languages: {}
    };
    for (state.year = 0; state.year < 4; state.year++) {
        state.index = 0;
        updateBox($("#" + getBoxId("s", state.year+1)), state);

        $("#" + getBoxId("s", state.year+1)).children().each(function (i) {
            previous.add($(this).attr("data-course-credit"));
        });

        for (state.index = 1; state.index <= 7; state.index++) {
            updateBox($("#" + getBoxId(state.index, state.year+1)), state);
        }

        for (state.index = 1; state.index <= 7; state.index++) {
            $("#" + getBoxId(state.index, state.year+1)).children().each(function (i) {
                previous.add($(this).attr("data-course-credit"));
            });
        }
    }

    // Check labs using the final list of courses
    for (lab_id in labs) {
        let requirements = labs[lab_id].prerequisites;
        let recommendations = labs[lab_id].recommended;
        let reqMet = checkTree(requirements, previous, null);
        let recMet = checkTree(recommendations, previous, null);
        var entry = $("#labs__"+lab_id);
        var status = entry.find(".labs__status");
        if (reqMet.state) {
            if(recMet.state) {
                entry.removeClass("table-success table-default");
                entry.addClass("table-primary");
                status.text("Recommended");
            }
            else{
                entry.removeClass("table-primary table-default");
                entry.addClass("table-success");
                status.text("Qualified");
            }
        }
        else {
            entry.removeClass("table-primary table-success");
            entry.addClass("table-default");
            status.text("Unqualified");
        }
    }

    // Was RS taken at all?
    if(state.rs_time === 0) {
        grad["rs1"] = 0;
    }

    // Check conditions depending only on the final courses
    grad = checkSimpleConditions(previous, grad);

    // Check language condition
    let max = 0;
    for (language in state.languages) {
        max = Math.max(max, state.languages[language]);
    }
    grad["lang"] = max;

    // Now display it
    showGradState(grad);
}

function updateBox($box, state) {
    $children = $box.children(".course");

    if ($children.length == 1) {
        updateElement($children[0].id, null, state);
    } else if ($children.length == 2) {
        updateElement($children[0].id, $children[1].getAttribute("data-course-id"), state);
        updateElement($children[1].id, $children[0].getAttribute("data-course-id"), state);
    }
}

function updateElement(id, other_sem, state) {
    // Find the course
    $course = $("#" + id);
    course = courses[$course.attr("data-course-id")];

    // Update requirements stuff
    if ((state.year < 2 || (state.year === 2 && state.index === 0)) && course.category === "Computer Science") {
        state.grad["cs"] += 1;
    }
    if (course.id === "3190T1" && state.rs_time === 0) {
        state.rs_time = state.year*2 + ((state.index === 0)?1:2);
    }
    else if (course.category === "Math" && state.rs_time >= state.year*2 + ((state.index === 0)?1:2) && other_sem !== "3190T1") {
        state.grad["rs1"] = 0;
    }

    if (course.category==="World Languages") {
        let language = languageFromName(course.short_name);
        if (language in state.languages) {
            state.languages[language] += 1;
        }
        else{
            state.languages[language] = 1;
        }
    }

    // Update the status
    result = checkTree(course.prerequisites, state.past, other_sem);
    if (result.state) {
        if (!course.availability[state.year]) {
            updateStatus(id, ICONS.CONDITIONAL, `This course is not offered in ${state.year+9}th grade, but this isn't a hard rule.`);
        } else {
            updateStatus(id, ICONS.SUCCESS, "Prerequisites are met.");
        }
    } else if (result.skippable) {
        // TODO make this show the course names too
        updateStatus(id, ICONS.CONDITIONAL, "This course can be taken if you test out of the following classes:\n - " + result.skips.join("\n - "));
    } else {
        let set = new Set();
        for (i in result.unmet) {
            for (j in result.unmet[i]) {
                set.add(result.unmet[i][j]);
            }
        }
        updateStatus(id, ICONS.FAILURE, "Prerequisites not met:\n" + treeToString(result.unmet) + "\nClick to view prerequisites", reqFilter(set));
    }
}

function checkTree(tree, past, other_sem) {
    if (tree === undefined) {
        // No prerequisites? Let it go.
        return {
            state: true
        };
    }

    let result = {
        state: false,
        skippable: false,
        unmet: [],
        skips: []
    };

    for (var i = 0; i < tree.length; i++) {
        // Check every set for matching
        let unmet = [];
        let match = true;
        let skip_match = true;

        for (var j = 0; j < tree[i].length; j++) {
            let prereq = tree[i][j];
            if (!(past.has(prereq) || prereq == other_sem)) {
                match = false;
                unmet.push(prereq);
                if (courses[prereq].skippable) {
                    result.skips.push(prereq);
                } else {
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

function updateStatus(target_id, icon, text, clickFilter = null) {
    $("#" + target_id).find("span").html("<abbr title=\"" + text + "\"><i class=\"" + icon + "\"></i></abbr>");
    if (clickFilter) {
        $("#" + target_id).find("span").click(function () {
            filter(clickFilter);
        });
    }
}

function treeToString(x) {
    if (x.length == 0) {
        return " None";
    }

    result = [];
    for (i in x) {
        for (j in x[i]) {
            result.push(" - " + getCourseNameString(x[i][j]));
        }
        if (i < x.length - 1) {
            result.push("or");
        }
    }

    return result.join("\n");
}
