import store from "../store.js";

const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

const defaultState = {
	modalOpen: false,
	modalAnimating: false,

	visualizerOpen: false,
	commentsOpen: false,

	minimized: false
};

let openedVisualizer = false;

let originalTabTitle = "";

export default function reducer(state, action) {
	
	const results = [
		handleModalOpen(state, action),
		handleModalClose(state, action),
		handleVisualizer(state, action),
		handleComments(state, action),
		handleMinimize(state, action),
		handleMaximize(state, action)
	];
	for (const res of results) {
		if (res) return res;
	}

	return state ? state : defaultState;
}

function handleModalOpen(state, action) {
	if (action.type === "OPEN_MODAL_PENDING") {
		return Object.assign({}, state, {
			modalAnimating: true
		});
	}
	else if (action.type === "OPEN_MODAL_FULFILLED") {
		return Object.assign({}, state, {
			modalOpen: true,
			modalAnimating: false
		});
	}
	else if (action.type === "OPEN_MODAL_REJECTED") {
		return Object.assign({}, state, {
			modalAnimating: false 
		});
	}
}
function handleModalClose(state, action) {
	if (action.type === "CLOSE_MODAL_PENDING") {
		return Object.assign({}, state, {
			modalAnimating: true
		});
	}
	else if (action.type === "CLOSE_MODAL_FULFILLED") {
		instantview.visualizer.stop();

		return Object.assign({}, state, {
			modalOpen: false,
			modalAnimating: false,
			visualizerOpen: false
		});
	}
	else if (action.type === "CLOSE_MODAL_REJECTED") {
		return Object.assign({}, state, {
			modalAnimating: false
		});
	}
	else if (action.type === "CLOSE_MODAL_MINI") {
		// remove left and top set by move handle
		instantview.modal.style.removeProperty("left");
		instantview.modal.style.removeProperty("top");
		return Object.assign({}, state, {
			minimized: false
		});
	}
}

function handleVisualizer(state, action) {
	if (action.type === "OPEN_VISUALIZER") {
		if (!openedVisualizer) {

			if (mode === prod) {
				chrome.storage.local.get("iv_last_vis", (result) => {
					if (result.iv_last_vis) {
						const modules = instantview.modal.getElementsByClassName("iv-visualizer-module");
						for (let i = 0; i < modules.length; i++) {
							const name = modules[i].getAttribute("data-name");
							if (name === result.iv_last_vis) {
								modules[i].click();
								openedVisualizer = true;
								instantview.visualizer.start();
								break;
							}
							else if (i === modules.length - 1) {
								document.querySelectorAll(".iv-visualizer-module")[0].click();
								openedVisualizer = true;
								instantview.visualizer.start();
							}
						}
					}
					else {
						document.querySelectorAll(".iv-visualizer-module")[0].click();
						openedVisualizer = true;
						instantview.visualizer.start();
					}
				});
			}
			else if (mode === dev) {
				document.querySelectorAll(".iv-visualizer-module")[0].click();
				openedVisualizer = true;
				instantview.visualizer.start();
			}
		}
		if (openedVisualizer) instantview.visualizer.start();
		return Object.assign({}, state, {
			visualizerOpen: true
		});
	}
	else if (action.type === "CLOSE_VISUALIZER") {
		instantview.visualizer.stop();
		return Object.assign({}, state, {
			visualizerOpen: false
		});
	}
}

function handleComments(state, action) {
	if (action.type === "OPEN_COMMENTS") {
		return Object.assign({}, state, {
			commentsOpen: true
		});
	}
	else if (action.type === "CLOSE_COMMENTS") {
		return Object.assign({}, state, {
			commentsOpen: false
		});
	}
}

function handleMinimize(state, action) {
	if (action.type === "MINIMIZE_MODAL_PENDING") {
		if (!state.minimized) {
			return Object.assign({}, state, {
				modalAnimating: true
			});
		}
	}
	else if (action.type === "MINIMIZE_MODAL_CLOSED") {
		return Object.assign({}, state, {
				minimized: true
			});
	}
	else if (action.type === "MINIMIZE_MODAL_FULFILLED") {
		return Object.assign({}, state, {
			modalAnimating: false
		});
	}
	else if (action.type === "MINIMIZE_MODAL_REJECTED") {
		return Object.assign({}, state, {
			modalAnimating: false
		});
	}
}

function handleMaximize(state, action) {
	if (action.type === "MAXIMIZE_MODAL_PENDING") {
		if (state.minimized) {
			return Object.assign({}, state, {
				modalAnimating: true
			});
		}
	}
	else if (action.type === "MAXIMIZE_MODAL_CLOSED") {
		return Object.assign({}, state, {
				minimized: false
			});
	}
	else if (action.type === "MAXIMIZE_MODAL_FULFILLED") {
		return Object.assign({}, state, {
			modalAnimating: false
		});
	}
	else if (action.type === "MAXIMIZE_MODAL_REJECTED") {
		return Object.assign({}, state, {
			modalAnimating: false
		});
	}
}