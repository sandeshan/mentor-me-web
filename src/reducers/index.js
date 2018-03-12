import { combineReducers } from 'redux';
import sessionReducer from './session';
import userReducer from './user';
import classesReducer from './classes';

const rootReducer = combineReducers({
    sessionState: sessionReducer,
    userState: userReducer,
    classesState: classesReducer
});

export default rootReducer;