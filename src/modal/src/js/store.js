import { applyMiddleware, createStore } from "redux";

import ReduxPromise from "redux-promise-middleware";
import ReduxLogger from "redux-logger";

import reducer from "./reducers";

const logger = store => next => action => {
	instantview.log(action.type);
	return next(action);
}

const middleware = applyMiddleware(ReduxPromise(), logger);
// needed since the first import in index.js is store
window.instantview = {};

export default createStore(reducer, middleware);