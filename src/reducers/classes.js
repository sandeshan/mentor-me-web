const INITIAL_STATE = {
    classes: {},
};

const applySetClasses = (state, action) => ({
    ...state,
    classes: action.classes
});

const applySetTeaching = (state, action) => ({
    ...state,
    teaching: action.teaching
});

function classesReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CLASSES_SET': {
            return applySetClasses(state, action);
        }
        case 'TEACHING_SET': {
            return applySetTeaching(state, action);
        }
        default: return state;
    }
}

export default classesReducer;