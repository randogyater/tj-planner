function getSettings() {
    return {
        math: $("#ms-math").val(),
        lang: $("#ms-lang").val(),
        lang_lvl: $("#ms-lang-level").val(),
        epf: $("#ms-epf-yes").prop("checked"),
        mentorship: $("#mentorship-check")
    }; 
}

function setSettings(settings) {
    $("#ms-math").val(settings.math);
    $("#ms-lang").val(settings.lang);
    $("#ms-lang-level").val(settings.lang_lvl);
    if(settings.epf) {
        $("#ms-epf-yes").click();
    }
    else{
        $("#ms-epf-no").click();
    }
    $("#mentorshipCheck").prop("checked", settings.mentorship);
    updateMentorship();
}

function getJSON() {
    return {
        settings: getSettings(),
        courses: readCourses()
    };
}

function loadJSON(saved) {
    setSettings(saved.settings);
    setCourses(saved.courses);
    onUpdate();
}

function getString() {
    return JSON.stringify(getJSON());
}

function loadString(string) {
    loadJSON(JSON.parse(string));
}

function saveToBox() {
    $("#save-area").val(getString());
}

function loadFromBox() {
    loadString($("#save-area").val());
}

function saveToClip() {
    navigator.clipboard.writeText(getString());
}

function loadFromClip() {
    navigator.clipboard.readText().then(clipText => loadString(clipText));
}

function exportSummary() {
    $("#export-area").text(getScheduleString(readCourses()));
}

function getScheduleString(schedule) {
    let lines = [];
    for(let i = 0; i<4; i++) {
        let row = schedule[i];
        lines.push("GRADE " + (i + 9));
        for(let j = 0; j < 9; j++) {
            let box_string = stringifyPeriod(row[j]);
            if(box_string.length > 0) {
                if(j == 0) {
                    box_string = "Summer: " + box_string;
                }
                else if (j == 8) {
                    box_string = "Online: " + box_string;
                }
                lines.push(" - " + box_string);
            }
        }
    }
    return lines.join("\n");
}

function stringifyPeriod(period) {
    if(period.length == 1) {
        return getCourseNameString(courses[period[0]]);
    }
    else if (period.length == 2){
        return getCourseNameString(courses[period[0]]) + " | " + getCourseNameString(courses[period[1]]);
    }
    else {
        return "";
    }
}