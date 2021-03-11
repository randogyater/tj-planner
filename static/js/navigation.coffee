filter = (condition) ->
    $("#filter-status").text("Filtering...")
    count = 0
    $entries = $(".catalog__entry")
    first = null
    for i in [0 ... $entries.length]
        $this = $($entries[i])
        course = courses[$this.attr("data-course-id")]
        if condition(course)
            count += 1
            if not first?
                first = $this[0]
            if ($this.is(":hidden"))
                $this.show("fast")
        else if not $this.is(":hidden")
            $this.hide("fast")
    if first?
        first.scrollIntoView()
    $("#filter-status").text("Showing #{count} of #{$entries.length} courses")

onSearch = () ->
    input = $("#search-box").val()
    if not input?
        return
    input = input.toLowerCase()
    filter((course) ->
        course.full_name.toLowerCase().includes(input) \
        or course.short_name.toLowerCase().includes(input))
    if input == ""
        $("#filter-status").text("Not filtering")
    return

reqFilter = (set) ->
    return (course) -> set.has(course.equivalent + "")

clearFilter = () ->
    $("#search-box").val("")
    filter((course) -> true)
    $("#filter-status").text("Not filtering")
    return