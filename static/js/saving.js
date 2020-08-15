function getSettings() {
    return {
        math: $("#ms-math").val(),
        lang: $("#ms-lang").val(),
        lang_lvl: $("#ms-lang-level").val(),
        epf: $("#ms-epf-yes").prop("checked")
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