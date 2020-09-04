setMentorship = (state) ->
    placeholder = $("#lab_placeholder")
    placeholderBox = $("#cell-5-4")
    mentorBoxes = $("#cell-6-4, #cell-7-4")
    middleBox = $("#cell-6-4")
    if state
        placeholder.addClass("mentorship")
        mentorBoxes.empty()
        mentorBoxes.addClass("filled")
        placeholderBox.addClass("grid__box--joined")
        mentorBoxes.addClass("grid__box--joined")
        middleBox.append(placeholder)
        placeholder.text("Mentorship")
    else
        placeholder.removeClass("mentorship")
        mentorBoxes.removeClass("filled")
        placeholderBox.removeClass("grid__box--joined")
        mentorBoxes.removeClass("grid__box--joined")
        placeholderBox.append(placeholder)
        placeholder.text("Senior Research Lab")
    return

updateMentorship = () ->
    setMentorship($("#mentorshipCheck").is(":checked"))
    onUpdate()