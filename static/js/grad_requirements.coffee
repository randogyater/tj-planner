SIMPLE_CONDITIONS = [
    ["math", (course) -> course.category=="Math"], # TODO RS1 and Algebra don't count here
    ["history", (course) -> course.category=="Social Studies" && course.ap=="pre" && course.id!="2221T1" && course.id!="244000" && course.id!="2360T1" && course.id!="2900T1"], 
    ["pe", (course) -> course.equivalent=="730000" || course.equivalent=="740500"],
    ["econ", (course) -> course.full_name.includes("Economics")] # Sometimes the obvious solution works
]

showGradState = (state) ->
    console.log(state)
    showGradReq(name, num) for name, num of state
    lang = $("#grad-lang")
    lang2 = $("#grad-lang2")
    if lang.hasClass("table-success") and !lang2.hasClass("table-success")
        lang2.addClass("table-success")
        lang2.removeClass("table-danger")
        boxes = lang2.find("i")
    if !lang.hasClass("table-success") and lang2.hasClass("table-success")
        lang.addClass("table-success")
        lang.removeClass("table-danger")
        boxes = lang1.find("i")
    if boxes?
        boxes.removeClass("fa-check-square")
        boxes.removeClass("fa-square")
        boxes.addClass("fa-minus-square")
    return

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
            $this = $(this) # once again
            $this.addClass("fa-square")
            $this.removeClass("fa-check-square")
            $this.removeClass("fa-minus-square"))
    else
        entry.addClass("table-success")
        entry.removeClass("table-danger")
        boxes.each(() ->
            $this = $(this) # once again
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
