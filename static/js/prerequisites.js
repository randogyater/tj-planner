function validate(grid, ms_courses) {

    var state = {
        past: new Set(ms_courses),
        present: new Set(ms_courses),
        grad: grad,
        languages: {},
        validity: [],
        labs: null
    };

    var location = {
        year: 0,
        index: 0
    };

    for(location.year = 0; location.year<4; location.year++) {
        let year_results = [];
        let year = grid[location.year];

        // The summer stuff
        for(course of year[0]){
            state.past.add(course);
        }
        location.index = 0;
        year_results.push(checkBox(year[0], state, location));
        for(course of year[0]){
            state.present.add(course);
        }

        // The main courses + online
        for(let i = 1; i<9; i++){
            for(course of year[i]){
                state.past.add(course);
            }
        }
        if (location.year === 3) {
            state.labs = checkLabs(state);
        }
        for(location.index = 1; location.index < 9; location.index++){
            year_results.push(checkBox(year[location.index], state, location));
        }
        for(let i = 1; i<9; i++){
            for(course of year[i]){
                state.present.add(course);
            }
        }
        state.validity.push(year_results);
    }

    // Was RS taken at all?
    if(!state.past.has(RS1)) {
        grad.rs1 = 0;
    }

    // Check conditions depending only on the final courses
    grad = checkSimpleConditions(state.past, grad);

    // Check language condition
    state.past.forEach(function(id) {
        let course = courses[id];
        if (course.category==="World Languages") {
            let language = languageFromName(course.short_name);
            if (language in state.languages) {
                state.languages[language] += 1;
            }
            else{
                state.languages[language] = 1;
            }
        }
    });
    let max = 0;
    for (language in state.languages) {
        max = Math.max(max, state.languages[language]);
    }
    grad.lang = max;

    return {
        validity: state.validity,
        grad: state.grad,
        labs: state.labs
    };
}

function checkBox(box, state, location) {
    switch(box.length) {
        case 1:
            return [checkCourse(box[0], null, state, location)];
        case 2:
            return [checkCourse(box[0], box[1], state, location), checkCourse(box[1], box[2], state, location)];
        default:
            return [];
    }
}

function checkCourse(course_id, other, state, location) {

    course = courses[course_id];

    // Update requirements stuff
    if ((location.year < 2 || (location.year === 2 && location.index === 0)) && course.category === "Computer Science") {
        state.grad.cs += 1;
    }
    if (course.category === "Mathematics" && !state.past.has(RS1) && other != RS1) {
        state.grad.rs1 = 0;
    }

    // Update the status
    return checkTree(course.prereqs, state.past, state.present, other);
}

function checkLabs(status) {
    result = {};
    for (var lab_id in labs) {
        let requirements = labs[lab_id].prereqs;
        let recommendations = labs[lab_id].recommended;
        let reqMet = checkTree(requirements, status.past, status.present, null);
        let recMet = checkTree(recommendations, status.past, status.present, null);
        if (reqMet.length === 0) {
            if(recMet.length === 0) {
                result[lab_id] = 2;
            }
            else{
                result[lab_id] = 1;
            }
        }
        else {
            result[lab_id] = 0;
        }
    }
    return result;
}

function checkTree(tree, past, present, other_sem) {
    if (tree === undefined || tree.length === 0) {
        // No prerequisites? Let it go.
        return [];
    }
    var total_unmet = [];
    for (var i = 0; i < tree.length; i++) {
        // Check every set for matching
        let unmet = [];

        for (var j = 0; j < tree[i].length; j++) {
            let prereq = tree[i][j];
            let isCoreq = false;
            if (prereq.charAt(prereq.length-1) == 'C'){
                prereq = prereq.substring(0, prereq.length-1);
                isCoreq = true;
            }
            if (!(past.has(prereq) || prereq == other_sem || (present.has(prereq) && isCoreq))) {
                unmet.push(prereq);
            }
        }

        if (unmet.length > 0) {
            total_unmet.push(unmet);
        }
        else {
            return [];
        }
    }

    return total_unmet;
}