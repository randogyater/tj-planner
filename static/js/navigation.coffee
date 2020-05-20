filter = (condition) ->
    count = 0
    $entries = $(".catalog__entry")
    $entries.each(() ->
        $this = $(this) # Sometimes it just looks surreal
        course = courses[$this.attr("data-course-id")]
        if condition(course)
            count += 1
            if ($this.is(":hidden"))
                $this.show(0)
        else if not $this.is(":hidden")
            $this.hide(0)
    )
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

onCategorySelect = () ->
    dest = toID($("#category-select").val())
    $("#category-jump-button").attr("href", "#catalog__" + dest)

reqFilter = (set) ->
    return (course) -> set.has(course.equivalent)

clearFilter = () ->
    $("#search-box").val("")
    filter((course) -> true)
    $("#filter-status").text("Not filtering")
    return