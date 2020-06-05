SIMPLE_CONDITIONS = [
    ["math", (course) -> course.category == "Math"], # TODO RS1 and Algebra don't count here
    ["history", (course) -> course.category == "Social Studies" and
     course.ap == "pre" and course.id != WORLD_HISTORY_2 and
      course.id != VA_US_GOV and
       course.id != US_VA_HISTORY and course.id != PSYCHOLOGY],
    ["pe", (course) -> course.equivalent == PE_9 || course.equivalent == PE_10],
    ["econ", (course) -> course.full_name.includes("Economics")]
    # Sometimes the obvious solution works
]

showGradState = (state) ->
    showGradReq(name, num) for name, num of state

showGradReq = (name, num) ->
    entry = $("#grad-#{name}")
    boxes = entry.find("i")
    floor = Math.round(num - 0.5)
    # Yes, I'm inferring how many are required from the number of checkboxes. Stop laughing.
    if boxes.length > floor
        entry.addClass("table-danger")
        entry.removeClass("table-success")
        checked = boxes.slice(0, floor)
        unchecked = boxes.slice(floor)
        checked.each(() ->
            $this = $(this) # once again
            $this.addClass("fa-check-square")
            $this.removeClass("fa-square")
            $this.removeClass("fa-minus-square"))
        unchecked.each(() ->
            $this = $(this)
            $this.addClass("fa-square")
            $this.removeClass("fa-check-square")
            $this.removeClass("fa-minus-square"))
    else
        entry.addClass("table-success")
        entry.removeClass("table-danger")
        boxes.each(() ->
            $this = $(this)
            $this.addClass("fa-check-square")
            $this.removeClass("fa-square")
            $this.removeClass("fa-minus-square"))

checkSimpleConditions = (past, grad) ->
    past.forEach (id) ->
        course = courses[id]
        for entry in SIMPLE_CONDITIONS
            name = entry[0]
            condition = entry[1]
            if condition(course)
                if course.semester
                    grad[name] += 1
                else
                    grad[name] += 2
    for entry in SIMPLE_CONDITIONS
        name = entry[0]
        grad[name] /= 2
    return grad

languageFromName = (name) ->
    # I apologize in advance for this function.
    split = name.split(/[ -]/)
    if split[0] == "AP"
        return split[1]
    else
        return split[0]