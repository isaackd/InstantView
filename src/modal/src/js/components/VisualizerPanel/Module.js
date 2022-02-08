import "./Module.css";

import svgload from "../../libs/svgload.js";
import ModuleIcon from "../../../icons/vis_module.svg";

const Module = (title, active = false) => {
	const base = document.createElement("div");
	base.classList.add("iv-visualizer-module");
	base.setAttribute("data-name", title);
	if (active) base.setAttribute("data-active", "");

	const modIcon = svgload(ModuleIcon);
	modIcon.classList.add("iv-visualizer-module-icon");
	modIcon.setAttribute("width", "24");
	modIcon.setAttribute("height", "24");

	const modTitle = document.createElement("span");
	modTitle.classList.add("iv-visualizer-module-title");
	modTitle.textContent = title || "N/A";

	base.append(modIcon, modTitle);

	return base;
}

export default Module;
