import "./ActionButton.css";

import svgload from "../../libs/svgload.js";

const ActionButton = (icon, title, iconSize = 16, storeChangeHandler) => {

    icon = svgload(icon);

    const base = document.createElement("button");
    base.classList.add("iv-action-button");

    icon.classList.add("iv-action-button-icon");

    const buttonTitle = document.createElement("span");
    buttonTitle.classList.add("iv-action-button-title");
    buttonTitle.textContent = title;

    base.append(icon, buttonTitle);
    return base;
};

export default ActionButton;
