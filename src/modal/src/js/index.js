const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import store from "./store.js";

import "./i18n.js";

import * as videoDataActions from "./actions/videoDataActions.js";
import * as stateActions from "./actions/stateActions.js";
import * as optionsActions from "./actions/optionsActions.js";
import * as ratingsActions from "./actions/ratingsActions.js";

import Modal from "./components/Modal.js";

import "../themes/light.scss";
import "../themes/dark.scss";
import "../themes/gray.scss";

instantview.store = store;

instantview.optionsActions = optionsActions;
instantview.stateActions = stateActions;
instantview.videoDataActions = videoDataActions;
instantview.ratingsActions = ratingsActions;

instantview.animationSpeed = 90;

instantview.modal = Modal(instantview.store);


instantview.log = function(text) {
	chrome.runtime.sendMessage({message: "log_request", log: text});
};


document.body.append(instantview.modal);

if (mode === dev) {
	import("./test.js").then(module => {
		document.body.prepend(module.default());
	});
	store.dispatch(stateActions.openModal(false));
	// setTimeout(() => {
	// 	store.dispatch(stateActions.minimizeModal());
	// }, 500);
}