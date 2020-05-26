function onUpdate() {
    previous = new Set();
    for (var c = 1; c <= 4; c++) {
        updateBox($("#" + getBoxId("s", c)), previous, c - 1);

        $("#" + getBoxId("s", c)).children().each(function (i) {
            previous.add($(this).attr("data-course-credit"));
        });

        for (var r = 1; r <= 7; r++) {
            updateBox($("#" + getBoxId(r, c)), previous, c - 1);
        }

        for (var r = 1; r <= 7; r++) {
            $("#" + getBoxId(r, c)).children().each(function (i) {
                previous.add($(this).attr("data-course-credit"));
            });
        }
    }
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
}

function updateBox($box, past, year) {
    $children = $box.children(".course");

    if ($children.length == 1) {
        updateElement($children[0].id, past, null, year);
    } else if ($children.length == 2) {
        updateElement($children[0].id, past, $children[1].getAttribute("data-course-id"), year);
        updateElement($children[1].id, past, $children[0].getAttribute("data-course-id"), year);
    }
}

function updateElement(id, past, other_sem, year) {
    $course = $("#" + id);
    course = courses[$course.attr("data-course-id")];

    result = checkTree(course.prerequisites, past, other_sem);
    if (result.state) {
        if (!course.availability[year]) {
            updateStatus(id, ICONS.CONDITIONAL, `This course is not offered in ${year+9}th grade, but this isn't a hard rule.`);
        } else {
            updateStatus(id, ICONS.SUCCESS, "Prerequisites are met.");
        }
    } else if (result.skippable) {
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
