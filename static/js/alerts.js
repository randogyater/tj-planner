function alert(content, type = "primary", duration=1000) {
    $("<div></div>").addClass("alert alert-" + type + " fixed-top hide").css("display", "none").text(content).appendTo("body").slideDown().delay(duration).slideUp().remove();
}