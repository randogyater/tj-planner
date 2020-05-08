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