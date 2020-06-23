sortLabs = () ->
    table = $("#lab-list > tbody")[0]
    list = $("#lab-list > tbody").find("tr").toArray()
    firstGreen = null
    firstWhite = null
    for lab in list
        $lab = $(lab)
        if $lab.hasClass("table-primary")
            if firstGreen
                table.insertBefore(lab, firstGreen)
            else if firstWhite
                table.insertBefore(lab, firstWhite)
        else if $lab.hasClass("table-success")
            if firstWhite
                table.insertBefore(lab, firstWhite)
            firstGreen = lab unless firstGreen
        else
            firstWhite = lab unless firstWhite
    return
