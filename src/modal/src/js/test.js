import "./test.scss";

import store from "./store.js";
import * as videoDataActions from "./actions/videoDataActions.js";
import * as stateActions from "./actions/stateActions.js";
import * as optionsActions from "./actions/optionsActions.js";

// import svgload from "./libs/svgload.js";
// import spinnerIcon from "../icons/spinner.svg";

const test = () => {
	const base = document.createElement("div");
	base.setAttribute("id", "buttons");

	// document.body.append(svgload(spinnerIcon));

	const loadVideoButton = document.createElement("button");
	loadVideoButton.textContent = "LOAD VIDEO";
	loadVideoButton.addEventListener("click", () => {
		videoDataActions.loadVideo("hC8CH0Z3L54");
	});

	const openButton = document.createElement("button");
	openButton.textContent = "OPEN MODAL";
	openButton.addEventListener("click", () => {
		store.dispatch(stateActions.openModal());
	});

	const toggleTheme = document.createElement("button");
	toggleTheme.textContent = "TOGGLE THEME";
	toggleTheme.addEventListener("click", () => {
		const options = store.getState().options;

		if (options.theme === "light") {
			store.dispatch(optionsActions.setOptions({theme: "dark"}));
			document.body.style.backgroundColor = "#212121";
		}
		else if (options.theme === "dark") {
			store.dispatch(optionsActions.setOptions({theme: "halloween"}));
			document.body.style.backgroundColor = "#212121";
		}
		else if (options.theme === "halloween") {
			store.dispatch(optionsActions.setOptions({theme: "gray"}));
			document.body.style.backgroundColor = "#111111";
		}
		else {
			store.dispatch(optionsActions.setOptions({theme: "light"}));
			document.body.style.backgroundColor = "#fafafa";
		}

	});

	base.append(loadVideoButton, openButton, toggleTheme, document.createElement("br"), document.createElement("br"));

	const miniPositions = ["br", "tr", "bl", "tl"];

	for (const pos of miniPositions) {
		const but = document.createElement("button");
		but.textContent = "MINI POSITION: " + pos.toUpperCase();
		but.addEventListener("click", () => {
			store.dispatch(optionsActions.setOptions({miniPosition: pos}));
		});
		base.append(but, document.createElement("br"));
	}

	const miniSize = document.createElement("input");
	miniSize.setAttribute("type", "range");
	miniSize.setAttribute("min", "10");
	miniSize.setAttribute("max", "30");
	miniSize.addEventListener("input", e => {
		store.dispatch(optionsActions.setOptions({miniSize: miniSize.value}));
	});

	base.append(miniSize);

	return base;
}

export default test;