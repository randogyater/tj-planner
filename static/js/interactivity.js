const ICONS = {
    SUCCESS: "fas fa-check-circle",
    FAILURE: "fas fa-times-circle",
    CONDITIONAL: "fas fa-exclamation-circle",
    ADDITIONAL: "fas fa-plus-circle",
    LOADING: "fas fa-spinner"
};

function allowDrop(event) {
    if (event.target.hasAttribute("ondrop") || $(event.target).parents("#catalog__sidebar")) {
        event.preventDefault();
    }
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();

    var id = event.dataTransfer.getData("text");

    if (validDrop(event)) {
        if (id.startsWith("c")) {
            event.target.appendChild(document.getElementById(id));
        } else {
            $(event.target).append(createCourseDraggable($("#" + id).attr("data-course-id")))
        }

        onUpdate();
    }
}

function toss(event) {
    var id = event.dataTransfer.getData("text");
    if (id.startsWith("c")) {
        event.preventDefault();

        $("#" + id).remove();

        onUpdate();
    }
}

function validDrop(event) {
    if (!event.target.getAttribute("class").includes("grid__box")) {
        return false;
    } else if (event.target.childElementCount == 0) {
        return true;
    } else if (event.target.childElementCount == 1 && event.target.firstElementChild.getAttribute("class").includes("course--semester")) {
        var id = event.dataTransfer.getData("text");
        if (id == "") {
            return true;
        } else if (id.startsWith("c")) {
            return $("#" + event.dataTransfer.getData("text")).attr("class").includes("course--semester");
        } else {
            return courses[$("#" + id).attr("data-course-id")].semester;
        }
    }
}