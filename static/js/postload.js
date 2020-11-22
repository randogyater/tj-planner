$(function() {
    $.getJSON("static/data/courses.json", function (data) {
        courses = data;
        $.getJSON("static/data/labs.json", function (data) {
            labs = data;
            $.getJSON("static/data/defaults.json", function (data) {
                defaults = data
                
                if (typeof(Storage) !== "undefined") {
                    let saved = localStorage.getItem("autosaved");
                    if (saved) {
                        loadString(saved);
                    }
                    else {
                        loadJSON(defaults.states.minimal);
                    }
                }
                else {
                    loadJSON(defaults.states.minimal);
                }
    
                let hints = defaults.hints;
                for (let i = 0; i < hints.length; i++) {
                    let item = hints[i];
                    $("#" + getBoxId(item.row, item.col)).append("<div class=\"m-auto grid__hint text-secondary\">" + item.text + "</div>");
                }
    
                onUpdate();
            });
        });
    });

    $("#search-box").keyup(function(event) {
        if (event.keyCode === 13) {
            onSearch();
        }
    });
});