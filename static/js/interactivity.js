function allowDrop(ev) {
    if(ev.target.childElementCount<=1) {
        ev.preventDefault();
    }
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text");
    if(validTarget(ev)){
        if(id.startsWith("c")){
            ev.target.appendChild(document.getElementById(id));
        }
        else {
            $(ev.target).append(createCourseDraggable($("#"+id).attr("data-course-id")))
        }
    }
}
function validTarget(ev) {
    if(!ev.target.getAttribute("class").includes("grid__box")){
        return false;
    }
    else if(ev.target.childElementCount == 0) {
        return true;
    }
    else if (ev.target.childElementCount == 1 && ev.target.firstElementChild.getAttribute("class").includes("course--semester")){
        var id = ev.dataTransfer.getData("text");
        if (id == "") {
            return true;
        }
        else if (id.startsWith("c")) {
            return $("#"+ev.dataTransfer.getData("text")).attr("class").includes("course--semester");
        }
        else {
            return courses[$("#"+id).attr("data-course-id")].semester;
        }
    }
}