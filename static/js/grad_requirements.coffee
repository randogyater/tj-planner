showGradState = (state) ->
    showGradReq(name, num) for name, num of state
    return

showGradReq = (name, num) ->
    entry = $("#grad-#{name}")
    boxes = entry.find("i")
    # Yes, I'm inferring how many are required from the number of checkboxes. Stop laughing.
    if boxes.length > num
        entry.addClass("table-danger")
        entry.removeClass("table-success")
        checked = boxes.slice(0, num)
        unchecked = boxes.slice(num)
        checked.each(() ->
            $this = $(this) # once again
            $this.addClass("fa-check-square")
            $this.removeClass("fa-square"))
        unchecked.each(() ->
            $this = $(this) # once again
            $this.addClass("fa-square")
            $this.removeClass("fa-check-square"))
    else
        entry.addClass("table-success")
        entry.removeClass("table-danger")
        boxes.each(() ->
            $this = $(this) # once again
            $this.addClass("fa-check-square")
            $this.removeClass("fa-square"))