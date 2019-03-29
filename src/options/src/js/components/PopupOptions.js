import { h } from "preact";

import OptionsGroup from "./OptionsGroup.js";

const PopupOptions = (props) => {
    const themeOptions = props.themes.map(name => {
        const lowerName = name.toLowerCase();
        return (
            <div>
                <input 
                    id={"theme-" + lowerName}
                    name="theme" 
                    value={lowerName}
                    {...{checked: props.theme === lowerName ? true : false}}
                    type="radio"></input>
                <label for="theme-light">{name}</label>
            </div>
        );
    });

    return (
        <OptionsGroup title="Popup" class="popup-opt" icon="icons/popup.svg">
            <div id="theme-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <span class="option-label">Theme</span>
                </div>
                <div id="theme-choices" onChange={props.handleThemeChange}>
                    {themeOptions}
                </div>
            </div>
            <div id="info-position-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <span class="option-label">Video Information Position</span>
                </div>
                <div id="info-position-choices" onChange={props.handleInfoPositionChange}>
                    <div>
                        <input 
                            id="info-position-top" 
                            name="info-position" 
                            value="top" 
                            {...{checked: props.infoPosition === "top" ? true : false}} 
                            type="radio"></input>
                        <label for="info-position-top">Top</label>
                    </div>
                    <div>
                        <input 
                            id="info-position-bottom" 
                            name="info-position" 
                            value="bottom" 
                            {...{checked: props.infoPosition === "bottom" ? true : false}}
                            type="radio"></input>
                        <label for="info-position-bottom">Bottom</label>
                    </div>
                </div>
                <div id="title-center-wrapper" class="option-wrapper">
                    <div class="input-wrapper">
                        <input 
                            id="title-center" 
                            type="checkbox" 
                            onChange={(e) => props.toggleOption("titleCenterEnabled")}
                            checked={props.titleCenterEnabled} />
                        <label for="title-center" class="option-label">Center video title</label>
                    </div>
                </div>
            </div>
            <div id="show-date-wrapper" class="option-wrapper">
                <label for="show-date" title="Show the date the video was published above the views" class="option-label">Show Date</label>
                <select id="show-date" 
                    value={props.showDate}
                    onChange={props.handleShowDateChange}>
                    <option value="off">Off</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                </select>
            </div>
            <div id="click-modifier-wrapper" class="option-wrapper">
                <label for="click-modifier" title="Only show the popup if the modifier key is pressed when a thumbnail is clicked" class="option-label">Click Modifier</label>
                <select id="click-modifier" 
                    value={props.clickModifier}
                    onChange={props.handleModifierChange}>
                    <option value="none">None (default)</option>
                    <option value="shift">Shift</option>
                    <option value="alt">Alt</option>
                    <option value="ctrl">Ctrl</option>
                </select>
            </div>
        </OptionsGroup>
    );
}

export default PopupOptions;