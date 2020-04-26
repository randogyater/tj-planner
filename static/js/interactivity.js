function allowDrop(ev) {
    if(validTarget(ev)){
        ev.preventDefault();
    }
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if(validTarget(ev)){
        ev.target.appendChild(document.getElementById(data));
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
        var id = ev.dataTransfer.getData("text")
        if (id != "") {
            return $("#"+ev.dataTransfer.getData("text")).attr("class").includes("course--semester");
        }
        return true;
    }
}