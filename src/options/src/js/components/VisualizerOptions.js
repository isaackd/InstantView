import { h } from "preact";

import OptionsGroup from "./OptionsGroup.js";

const VisualizerOptions = (props) => {
    const customColorsAdditional = (
        <div id="custom-colors-additional">
            <div>
                <label for="primary-color">Primary</label>
                <input id="primary-color" value={props.primaryColor} onInput={props.handleColorChange} type="color"></input>
            </div>
            <div>
                <label for="secondary-color">Secondary</label>
                <input id="secondary-color" value={props.secondaryColor} onInput={props.handleColorChange} type="color"></input>
            </div>
        </div>
    );

    const overlayModeAdditional = (
        <div id="overlay-mode-additional">
            <div id="overlay-opacity-wrapper" class="option-wrapper">
                <label for="overlay-opacity" title="Changes the opacity of the overlayed visualizers">Opacity</label>
                <input 
                    id="mini-size" 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.01" 
                    onInput={props.handleOverlayOpacityChange}
                    value={props.overlayOpacity} />
                <input 
                    type="number" 
                    min="0.1" 
                    max="1"
                    step="0.01" 
                    onInput={props.handleOverlayOpacityChange} 
                    class="mini-size-display"
                    value={props.overlayOpacity} />
            </div>
            <div id="backdrop-opacity-wrapper" class="option-wrapper">
                <label for="backdrop-opacity" title="Changes the opacity of the overlayed visualizers">Backdrop Opacity</label>
                <input 
                    id="mini-size" 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    onInput={props.handleBackdropOpacityChange}
                    value={props.backdropOpacity} />
                <input 
                    type="number" 
                    min="0" 
                    max="1"
                    step="0.01" 
                    onInput={props.handleBackdropOpacityChange} 
                    class="mini-size-display"
                    value={props.backdropOpacity} />
            </div>
            <div id="backdrop-color-wrapper">
                <label for="backdrop-color">Backdrop Color</label>
                <input id="backdrop-color" value={props.backdropColor} onInput={props.handleBackdropColorChange} type="color"></input>
            </div>
        </div>
    );

    return (
        <OptionsGroup title="Visualizer" class="vis-opt" icon="icons/visualizer.svg">
            <div id="overlay-mode-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="overlay-mode" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("overlayMode")}
                        checked={props.overlayMode} />
                    <label for="overlay-mode" class="option-label" title="Overlays the visualizer over the video instead of in a separate panel" >Overlay visualizers on top of the video</label>
                </div>
                {props.overlayMode ? overlayModeAdditional : null}
            </div>
            <div id="custom-colors-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="custom-colors" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("customColorsEnabled")}
                        checked={props.customColorsEnabled} />
                    <label for="custom-colors" class="option-label" title="Allows you to set custom colors for visualizers to use" >Enable custom visualizer colors</label>
                </div>
                {props.customColorsEnabled ? customColorsAdditional : null}
            </div>
            <div id="animation-speed-wrapper" class="option-wrapper">
                <label for="animation-speed" title="Change the speed of visualizers that use elapsed time to move (Iverjo, Plaid). Mainly for high refresh rate monitors" class="option-label">Animation Speed</label>
                <input 
                    id="animation-speed" 
                    type="range" 
                    min="10" 
                    max="150" 
                    step="1" 
                    onInput={props.handleSpeedChange}
                    value={props.animationSpeed} />
                <input 
                    type="number" 
                    min="10" 
                    max="150" 
                    onInput={props.handleSpeedChange} 
                    class="animation-speed-display"
                    value={props.animationSpeed} />
            </div>
            <div id="fft-size-wrapper" class="option-wrapper">
                <label for="fft-size" title="Source of video and channel data" class="option-label">FFT Size</label>
                <select id="fft-size"
                    value={props.fftSize}
                    onChange={props.handleFFTSizeChange}>
                    <optgroup label="Light">
                        <option value="32">32</option>
                        <option value="64">64</option>
                        <option value="128">128</option>
                        <option value="256">256</option>
                        <option value="512">512</option>
                    </optgroup>
                    <optgroup label="Normal">
                        <option value="1024">1024</option>
                        <option value="2048">2048 (default)</option>
                        <option value="4096">4096</option>
                    </optgroup>
                    <optgroup label="Intensive">
                        <option value="8192">8192</option>
                        <option value="16384">16384</option>
                        <option value="32768">32768</option>
                    </optgroup>
                </select>
            </div>
        </OptionsGroup>
    );
}

export default VisualizerOptions;
