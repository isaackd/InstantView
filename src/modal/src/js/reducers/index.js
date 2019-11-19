import { combineReducers } from "redux";

import videoData from "./videoDataReducer.js";
import options from "./optionsReducer.js";
import state from "./stateReducer.js";

import ratings from "./ratingsReducer.js";

export default combineReducers({
    videoData,
    options,
    state,
    ratings
});
