onSearch = () ->
    input = $("#search_box").val().toLowerCase()
    filter((course) ->
        course.full_name.toLowerCase().includes(input) \
        or course.short_name.toLowerCase().includes(input))
    return

onCategorySelect = () ->
    dest = toID($("#category-select").val())
    $("#category-jump-button").attr("href", "#catalog__" + dest)