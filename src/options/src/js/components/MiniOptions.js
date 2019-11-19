import { h } from "preact";

import OptionsGroup from "./OptionsGroup.js";

const MiniOptions = (props) => {
    return (
        <OptionsGroup title="Mini Mode" class="mini-opt" icon="icons/mini.svg">
            <div id="mini-default-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="mini-default" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("miniDefault")}
                        checked={props.miniDefault} />
                    <label for="mini-default" class="option-label">Open mini player by default</label>
                </div>
            </div>
            <div id="mini-position-wrapper" class="option-wrapper">
                <label for="mini-position" title="Changes the position of the mini player" class="option-label">Mini Position</label>
                <select id="mini-position" 
                    value={props.miniPosition}
                    onChange={props.handleMiniPositionChange}>
                    <option value="br">Bottom Right</option>
                    <option value="bl">Bottom Left</option>
                    <option value="tr">Top Right</option>
                    <option value="tl">Top Left</option>
                </select>
            </div>
            <div id="mini-size-wrapper" class="option-wrapper">
                <label for="mini-size" title="Changes the size of the mini player" class="option-label">Mini Size</label>
                <input 
                    id="mini-size" 
                    type="range" 
                    min="10" 
                    max="30" 
                    step="1" 
                    onInput={props.handleMiniSizeChange}
                    value={props.miniSize} />
                <input 
                    type="number" 
                    min="10" 
                    max="30" 
                    onInput={props.handleMiniSizeChange} 
                    class="mini-size-display"
                    value={props.miniSize} />
            </div>
        </OptionsGroup>
    );
}

export default MiniOptions;
