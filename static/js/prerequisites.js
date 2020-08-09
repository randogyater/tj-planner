function validate(grid, ms_courses) {

    var state = {
        past: new Set(ms_courses),
        present: new Set(ms_courses),
        year: 0,
        grad: grad,
        index: 0,
        rs_time: 0, // This is actually 2 + the current year * 2, minus 1 if it was in summer
        languages: {},
        validity: [],
        lab_past: null,
        lab_present: null
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
        year_results.push(checkBox(year[0], state));
        for(course of year[0]){
            state.present.add(course);
        }

        

        // The main courses + online
        for(let i = 1; i<8; i++){
            for(course of year[i]){
                state.past.add(course);
            }
        }
        if (location.year === 3) {
            state.lab_past = new Set(state.past);
            state.lab_present = new Set(state.present);
        }
        for(location.index = 1; location.index < 8; location.index++){
            year_results.push(checkBox(year[location.index], state, location));
        }
        for(let i = 1; i<8; i++){
            for(course of year[i]){
                state.present.add(course);
            }
        }
        state.validity.push(year_results);
    }

    return state;
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
    if (course.id == RS1 && state.rs_time === 0) {
        state.rs_time = location.year*2 + ((location.index === 0)?1:2);
    }
    else if (course.category === "Mathematics" && (state.rs_time === 0 || state.rs_time >= location.year*2 + ((location.index === 0)?1:2)) && other != RS1) {
        state.grad.rs1 = 0;
    }

    // Update the status
    return checkTree(course.prereqs, state.past, state.present, other);
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