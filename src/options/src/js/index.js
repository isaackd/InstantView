import { h, render, Component } from "preact";

import "../styles/styles.scss";

import OptionsGroup from "./components/OptionsGroup.js";

import PopupOptions from "./components/PopupOptions.js";
import MiniOptions from "./components/MiniOptions.js";
import CommentsOptions from "./components/CommentsOptions.js";
import VisualizerOptions from "./components/VisualizerOptions.js";

class OptionsPage extends Component {

	constructor() {
		super();

		this.themes = ["Light", "Dark", "Gray"];

		this.defaultOptions = {
			// visualizer
			customColorsEnabled: false,
			animationSpeed: 90,
			fftSize: 2048,
			primaryColor: "#C8C800",
			secondaryColor: "#00eeee",
			overlayMode: false,
			overlayOpacity: 0.70,
			backdropOpacity: 0,
			backdropColor: "#000000",
			// mini player
			miniSize: 25,
			miniPosition: "br",
			miniDefault: false,
			// comments
			commentBorders: false,
			commentSpacing: false,
			commentSeparation: false,
			// popup
			infoPosition: "bottom",
			theme: "light",
			clickModifier: "none",
			titleCenterEnabled: false,
			showDate: "top",

			dataSource: "youtube"
		};

		this.state = Object.assign({}, this.defaultOptions);
	}

	componentDidMount() {
		this.loadOptions().then(options => {
			this.setState(Object.assign({}, options));
			console.log("Loaded saved options", options);
		})
		.catch(e => {
			console.log("Couldn\'t get saved user options. Using defaults.");
		});
	}

	componentDidUpdate() {
		// update chrome storage every time an option is changed
		this.saveOptions(this.state);
	}

	saveOptions(newOptions) {
		console.log(newOptions);
		return new Promise((resolve, reject) => {
			chrome.storage.local.set({iv_options: JSON.stringify(newOptions)}, function() {
				resolve(newOptions);
			});
		});
	}

	loadOptions() {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get("iv_options", items => {
				if (items && items.iv_options) {

					const parsedOptions = JSON.parse(items.iv_options);

					// make sure the current selected theme actually exists
					// (season themes are removed)
					const currentTheme = parsedOptions.theme;
					for (const theme of this.themes) {
						if (currentTheme === theme.toLowerCase()) {
							resolve(parsedOptions);
							return;
						}
					}
					console.log(`Invalid theme: ${currentTheme}. Setting to light..`);
					// if the current selected theme no longer exists, set it back to light
					const newOptions = Object.assign(parsedOptions, {theme: "light"});
					this.saveOptions(newOptions).then(() => {
						resolve(newOptions);
					});
				}
				else {
					// if there aren't any saved options, use the defaults
					this.saveOptions(this.state);
					reject("Cannot get saved options, using defaults");
				}
			});
		});
	}

	toggleOption = (name) => {
		if (this.state.hasOwnProperty(name)) {
			const newState = {};
			newState[name] = !this.state[name];
			this.setState(newState);
		}
		else {
			throw new Error(`\'${name}\' is not an option`);
		}
	}

	handleOverlayOpacityChange = (e) => {
		this.setState({overlayOpacity: parseFloat(e.target.value, 10)});
	}

	handleBackdropOpacityChange = (e) => {
		this.setState({backdropOpacity: parseFloat(e.target.value, 10)});
	}

	handleBackdropColorChange = (e) => {
		const id = e.target.id;
		if (id === "backdrop-color") {
			this.setState({backdropColor: e.target.value});
		}
	}

	handleSpeedChange = (e) => {
		this.setState({animationSpeed: parseInt(e.target.value, 10)});
	}

	handleFFTSizeChange = (e) => {
		this.setState({fftSize: parseInt(e.target.value, 10)});
	}

	handleMiniSizeChange = (e) => {
		this.setState({miniSize: parseInt(e.target.value, 10)});
	}

	handleMiniPositionChange = (e) => {
		this.setState({miniPosition: e.target.value});
	}

	handleThemeChange = (e) => {
		this.setState({theme: e.target.value});
	}

	handleInfoPositionChange = (e) => {
		this.setState({infoPosition: e.target.value});
	}

	handleRestoreDefaults = (e) => {
		const confirmation = confirm("Are you sure you want to restore the default options?");
		if (confirmation) {
			this.setState(Object.assign(this.state, this.defaultOptions));
		}
	}

	handleModifierChange = (e) => {
		this.setState({clickModifier: e.target.value});
	}

	handleShowDateChange = (e) => {
		this.setState({showDate: e.target.value});
	}

	handleDataSourceChange = (e) => {
		this.setState({dataSource: e.target.value});
	}

	handleColorChange = (e) => {
		const id = e.target.id;
		if (id === "primary-color") {
			this.setState({primaryColor: e.target.value});
		}
		else if (id === "secondary-color") {
			this.setState({secondaryColor: e.target.value});
		}
	}

	render(props) {

		return (
			<div id="options-page">
				
				<PopupOptions
					themes={this.themes}

					theme={this.state.theme}
					infoPosition={this.state.infoPosition}
					clickModifier={this.state.clickModifier}
					showDate={this.state.showDate}
					dataSource={this.state.dataSource}
					titleCenterEnabled={this.state.titleCenterEnabled}
					captureMediaKeys={this.state.captureMediaKeys}

					handleThemeChange={this.handleThemeChange}
					handleInfoPositionChange={this.handleInfoPositionChange}
					handleModifierChange={this.handleModifierChange}
					handleShowDateChange={this.handleShowDateChange}
					handleDataSourceChange={this.handleDataSourceChange}
					toggleTitleCenter={this.toggleTitleCenter}
					toggleOption={this.toggleOption} />

				<MiniOptions 
					miniPosition={this.state.miniPosition}
					miniSize={this.state.miniSize}
					miniDefault={this.state.miniDefault}

					handleMiniPositionChange={this.handleMiniPositionChange}
					handleMiniSizeChange={this.handleMiniSizeChange}

					toggleOption={this.toggleOption} />

				<CommentsOptions
					commentBorders={this.state.commentBorders}
					commentSpacing={this.state.commentSpacing}
					commentSeparation={this.state.commentSeparation}

					toggleOption={this.toggleOption} />

				<VisualizerOptions 
					primaryColor={this.state.primaryColor} 
					secondaryColor={this.state.secondaryColor}
					customColorsEnabled={this.state.customColorsEnabled}
					animationSpeed={this.state.animationSpeed}
					fftSize={this.state.fftSize}
					overlayMode={this.state.overlayMode}
					overlayOpacity={this.state.overlayOpacity}
					backdropOpacity={this.state.backdropOpacity}
					backdropColor={this.state.backdropColor}
					
					handleSpeedChange={this.handleSpeedChange}
					handleFFTSizeChange={this.handleFFTSizeChange}
					handleColorChange={this.handleColorChange}
					handleOverlayOpacityChange={this.handleOverlayOpacityChange}
					handleBackdropOpacityChange={this.handleBackdropOpacityChange}
					handleBackdropColorChange={this.handleBackdropColorChange}

					toggleOption={this.toggleOption} />
				<div id="actions">
					<input 
						id="restore-defaults" 
						type="button" 
						value="Restore Default Options"
						onClick={this.handleRestoreDefaults} />
				</div>
				<div id="links">
					<a target="_blank" rel="noopener" href="https://chrome.google.com/webstore/detail/instantview-for-youtube/pababfeapfpjaghmlfipkcoioeflpbio/reviews">RATE</a>
					<a target="_blank" rel="noopener" href="https://chrome.google.com/webstore/detail/instantview-for-youtube/pababfeapfpjaghmlfipkcoioeflpbio/support">ISSUES / FEEDBACK</a>
					<span>EMAIL: afrmtbl@gmail.com</span>
				</div>
			</div>
		);
	}
}

render(<OptionsPage />, document.body);
