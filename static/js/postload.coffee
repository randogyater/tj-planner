$(() ->
    $("#search-box").keyup((event) ->
        if event.keyCode == 13
            onSearch()
        return
    )
    return
)