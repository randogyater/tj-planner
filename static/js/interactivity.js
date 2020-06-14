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
            $(event.target).append(createCourseDraggable($("#" + id).attr("data-course-id")));
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
    var target = $(event.target);
    var id = event.dataTransfer.getData("text");
    var course_dragged = courses[$("#" + id).attr("data-course-id")];
    if (!target.hasClass("grid__box")) {
        return false;
    } else {
        if(!boxTypeAllowed(course_dragged, boxType(target))) {
            return false;
        }
        contents = target.children(".course");
        if (contents.length === 0) {
            return true;
        } else if (contents.length == 1 && contents[0].getAttribute("class").includes("course--semester")) {
            if (id === "") {
                return true;
            } else if (id.startsWith("c")) {
                return $("#" + event.dataTransfer.getData("text")).attr("class").includes("course--semester");
            } else {
                return course_dragged.semester;
            }
        }
    }
}

function boxType(box) {
    if(box.hasClass("grid__box--summer")) {
        return 1;
    }
    if(box.hasClass("grid__box--online")) {
        return 2;
    }
    return 0;
}

function boxTypeAllowed(course, type) {
    switch(type) {
        case 0:
            return course["category"] !== "Online" && course["category"] !== "Summer School"
        case 1:
            return course["category"] === "Summer School"
        case 2:
            return course["category"] === "Online" || course["online"]
    }
}