import "./test.css";

import store from "./store.js";

import * as stateActions from "./actions/stateActions.js";
import * as optionsActions from "./actions/optionsActions.js";

const test = () => {
	const base = document.createElement("div");
	base.setAttribute("id", "buttons");

	// document.body.append(svgload(spinnerIcon));

	const loadVideoButton = document.createElement("button");
	loadVideoButton.textContent = "LOAD VIDEO";
	loadVideoButton.addEventListener("click", () => {
		instantview.player.loadVideoById("hC8CH0Z3L54");
	});

	const openButton = document.createElement("button");
	openButton.textContent = "OPEN MODAL";
	openButton.addEventListener("click", () => {
		store.dispatch(stateActions.openModal());
	});

	const toggleTheme = document.createElement("button");
	toggleTheme.textContent = "NEXT THEME";
	toggleTheme.addEventListener("click", () => {
		const options = store.getState().options;

		if (options.theme === "light") {
			store.dispatch(optionsActions.setOptions({theme: "dark"}));
			document.body.style.backgroundColor = "#212121";
		}
		else if (options.theme === "dark") {
			store.dispatch(optionsActions.setOptions({theme: "gray"}));
			document.body.style.backgroundColor = "#212121";
		}
		else if (options.theme === "gray") {
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
	miniSize.addEventListener("input", () => {
		store.dispatch(optionsActions.setOptions({miniSize: miniSize.value}));
	});

	base.append(miniSize);

	// Make InstantView think we're on material design YouTube
	const app = document.createElement("ytd-app"); 
	document.body.append(app);

	app.innerHTML = `<ytd-video-renderer class="style-scope ytd-expanded-shelf-contents-renderer" lockup="">
	
	<div id="dismissable" class="style-scope ytd-video-renderer">
	  <ytd-thumbnail use-hovered-property="" class="style-scope ytd-video-renderer">
	
	
	<a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="null" href="/watch?v=UZd2REpVK3Y">
	  <yt-img-shadow class="style-scope ytd-thumbnail no-transition" loaded="" style="background-color: transparent;"><img id="img" class="style-scope yt-img-shadow" alt="" width="246" src="https://i.ytimg.com/vi/UZd2REpVK3Y/hqdefault.jpg?sqp=-oaymwEZCPYBEIoBSFXyq4qpAwsIARUAAIhCGAFwAQ==&amp;rs=AOn4CLBRqUH9kZaVORYeuPX7F1e3eBh6tQ"></yt-img-shadow>
	  
	  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" overlay-style="DEFAULT"><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="14 minutes">
	  14:59
	</span></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail">
	
	<span class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span>
  </ytd-thumbnail-overlay-now-playing-renderer></div>
	  <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div>
	  <div id="hover-overlays" class="style-scope ytd-thumbnail"></div>
	</a>
  </ytd-thumbnail>
	  <div class="text-wrapper style-scope ytd-video-renderer">
		<div id="meta" class="style-scope ytd-video-renderer">
		  <div id="title-wrapper" class="style-scope ytd-video-renderer">
			<h3 class="title-and-badge style-scope ytd-video-renderer">
			  <ytd-badge-supported-renderer class="style-scope ytd-video-renderer" disable-upgrade="" hidden="">
			  </ytd-badge-supported-renderer>
			  <a id="video-title" class="yt-simple-endpoint style-scope ytd-video-renderer" title="The Weird Side Of Amazon" href="/watch?v=UZd2REpVK3Y" aria-label="The Weird Side Of Amazon by Danny Gonzalez 1 day ago 14 minutes 1,822,082 views">
				The Weird Side Of Amazon
			  </a>
			</h3>
			<div id="menu" class="style-scope ytd-video-renderer"><ytd-menu-renderer class="style-scope ytd-video-renderer">
	
	<div id="top-level-buttons" class="style-scope ytd-menu-renderer"></div>
	<yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer"><button id="button" class="style-scope yt-icon-button" aria-label="Action menu">
	  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon">
		<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path>
	  </g></svg>
	
	
  </yt-icon>
	</button></yt-icon-button>
  </ytd-menu-renderer></div>
		  </div>
		  <ytd-video-meta-block class="style-scope ytd-video-renderer">
	
	
	
	<div id="metadata" class="style-scope ytd-video-meta-block">
	  <div id="byline-container" class="style-scope ytd-video-meta-block">
		<ytd-channel-name id="channel-name" class="style-scope ytd-video-meta-block">
	
	<div id="container" class="style-scope ytd-channel-name">
	  <div id="text-container" class="style-scope ytd-channel-name">
		<yt-formatted-string id="text" class="style-scope ytd-channel-name complex-string" ellipsis-truncate="" title="Danny Gonzalez" has-link-only_=""><a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false" href="/user/ActualDannyGonzalez">Danny Gonzalez</a></yt-formatted-string>
	  </div>
	  <paper-tooltip position="top" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1"><!--css-build:shady-->

	<div id="tooltip" class="hidden style-scope paper-tooltip">
	  
	</div>
</paper-tooltip>
	</div>
	<ytd-badge-supported-renderer class="style-scope ytd-channel-name">
	
	
	  <div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer">
		<yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10 S17.52,2,12,2z M9.92,17.93l-4.95-4.95l2.05-2.05l2.9,2.9l7.35-7.35l2.05,2.05L9.92,17.93z" class="style-scope yt-icon"></path>
	  </g></svg>
	
	
  </yt-icon>
		<span class="style-scope ytd-badge-supported-renderer"></span>
	  <paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1"><!--css-build:shady-->

	<div id="tooltip" class="hidden style-scope paper-tooltip">
	  Verified
	</div>
</paper-tooltip></div>
	<dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat>
  </ytd-badge-supported-renderer>
  </ytd-channel-name>
		<div id="separator" class="style-scope ytd-video-meta-block">•</div>
	  </div>
	  <div id="metadata-line" class="style-scope ytd-video-meta-block">
		
		  <span class="style-scope ytd-video-meta-block">1.8M views</span>
		
		  <span class="style-scope ytd-video-meta-block">1 day ago</span>
		<dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat>
	  </div>
	</div>
	<div id="additional-metadata-line" class="style-scope ytd-video-meta-block">
	  <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat>
	</div>
	
  </ytd-video-meta-block>
		</div>
		<yt-formatted-string id="description-text" class="style-scope ytd-video-renderer">What this Amazon doing? Why this is Amazon doing this? Haha and we talk about Jeremy Renner too ok
also sorry this video is so dark and looks like an apology video or something we just moved and i ...</yt-formatted-string>
		<ytd-badge-supported-renderer id="badges" class="style-scope ytd-video-renderer" disable-upgrade="" hidden="">
		</ytd-badge-supported-renderer>
		<div id="buttons" class="style-scope ytd-video-renderer"></div>
	  </div>
	</div>
	<div id="dismissed" class="style-scope ytd-video-renderer"></div>
  </ytd-video-renderer>`;

	return base;
};

export default test;
