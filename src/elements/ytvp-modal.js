// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide
// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide
// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide

class YTVPModal extends HTMLElement {

	static log(msg, prefix = "YTVP Modal") {
		if (!msg || !prefix) return;
		console.info(`[ %c${prefix} %c] %c${msg}`, "color: blue", "", "color: green");
	}
	static get observedAttributes() {
    	return ["data-theater", "data-theme", "data-top", "data-compact"];
  	}
  	static get defaultOptions() {
  		return {
  			// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js
  			API_KEY: null,

		  	VIDEO_GET: 'https://www.googleapis.com/youtube/v3/videos?id=',
		  	VIDEO_PARTS: '&part=snippet,statistics&fields=items(snippet(title,channelId),statistics(viewCount,likeCount,dislikeCount))',

		  	CHANNEL_GET: 'https://www.googleapis.com/youtube/v3/channels?id=',
		  	CHANNEL_PARTS: '&part=snippet&fields=items(snippet/title)',

		  	BASIC_URL: 'https://www.youtube.com/get_video_info?html5=1&video_id=',

		  	EMBED_URL: 'https://www.youtube.com/embed/', // add video id
		  	WATCH_URL: 'https://www.youtube.com/watch?v=', // add video id
		  	CHANNEL_URL: 'https://www.youtube.com/channel/', // add channelId

  			defaultInfo: {
  				id: "",
				title: "N/A", // video title
				videoURL: "javascript:void(null);",
				views: "N/A", // video views
				ratings: [1, 0], // likes - dislikes

				channel: "N/A", // channel name
				channelURL: "javascript:void(null);", // channel url
				subscribeStatus: false // if the user is subscribed
			},
			retrievingInfo: {title: "RETRIEVING", views: "RETRIEVING", channel: "RETRIEVING"}
  		};
  	}
  	static get defaultPreferences() {
  		return {
  			theme: "light",
  			infoTop: false,
  			theaterMode: false,
  			compactView: false
  		};
  	}
  	static get defaultHTML() {
  		return `
			<ytvp-modal-player></ytvp-modal-player>
			<ytvp-modal-info>
				<ytvp-modal-info-title>
					<a class="ytvp-video-title ytvp-primary-text" target="_blank">${this.defaultVideoTitle}</a>
				</ytvp-modal-info-title>
				<ytvp-modal-info-extra>
					<p class="ytvp-video-views ytvp-secondary-text">${this.defaultVideViews} VIEWS</p>
					<progress class="ytvp-video-ratings"></progress>
				</ytvp-modal-info-extra>
			</ytvp-modal-info>
			<ytvp-modal-actions>
				<ytvp-modal-channel>
					<a class="ytvp-channel-title ytvp-tertiary-text" target="_blank"></a>
					<ytvp-subscribe-button>
						<p class="ytvp-subscribe-status ytvp-tertiary-text">SUBSCRIBE</p>
					</ytvp-subscribe-button>
				</ytvp-modal-channel>
			</ytvp-modal-actions>
		`;
  	}
	// https://stackoverflow.com/a/9462382
	static formatViews(views, digits = 2) {
		if (!views) return;
		views = parseInt(views);
	  	let si = [{ value: 1E12, symbol: "T" }, { value: 1E9,  symbol: "B" }, { value: 1E6,  symbol: "M" },{ value: 1E3,  symbol: "K" }];
	  	let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

	  	for (let i = 0; i < si.length; i++) {
	    	if (views >= si[i].value) {
	     	 	return (views / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    		}
	  	}
	  	return views.toFixed(digits).replace(rx, "$1");
	}
	// https://github.com/ngzhian/quickview-chrome/blob/54fcc396d6d7fe6c964f9d014e2d08ac7c28ecb4/qv.js#L41
	static extractVideoId(videoURL) {
		if (!videoURL) throw new Error("VideoURL invalid..");
    	const url = videoURL;
   	 	return url.match(/v(\=|\/)([^=&\/]+)/)[0].substring(2);
  	}

	init(YT, API_KEY, options) {
		if (!YT) throw Error("YTVP Modal needs a YT object.\nhttps://developers.google.com/youtube/iframe_api_reference");
		if (!API_KEY) console.info("Using YTVPModal without an API KEY will result in missing video data for: likes and dislikes (bar below views), and channel url");

		this.options = Object.assign({}, this.constructor.defaultOptions, options);
		this.options.API_KEY = API_KEY;

		this.preferences = Object.assign({}, this.constructor.defaultPreferences, this.userPrefs);
		console.table(this.preferences);

		for (const pref in this.preferences) {
			this[pref] = this.preferences[pref];
		}

		this.currentVideoInfo = this.options.defaultInfo;
		// window.addEventListener("resize", () => this.resizeVideo());

	}

	connectedCallback() {
		this.innerHTML = this.constructor.defaultHTML;

		this.videoContainer = this.getElementsByTagName("ytvp-modal-player")[0];
		this.playerPlaceholder = document.createElement("div");

		this.info = this.getElementsByTagName("ytvp-modal-info")[0];
		this.actions = this.getElementsByTagName("ytvp-modal-actions")[0];

		this.videoTitle = this.getElementsByClassName("ytvp-video-title")[0];
		this.videoViews = this.getElementsByClassName("ytvp-video-views")[0];
		this.videoRatings = this.getElementsByClassName("ytvp-video-ratings")[0];

		this.channel = this.getElementsByClassName("ytvp-channel-title")[0];

		this.channelSubscribeButton = this.getElementsByTagName("ytvp-subscribe-button")[0];
		this.channelSubscribeStatus = this.getElementsByClassName("ytvp-subscribe-status")[0];

		this.channelSubscribeButton.addEventListener("click", e => {
			if (this.channel.href !== "javascript:void(null);") {
				location.replace(`${this.channel.href}?sub_confirmation=1`);
			}
		});

		this.actionButtons = [
			this.createActionButton("theater", "theaters", "ytvp-modal-theater-button", e => { this.theaterMode = !this.theaterMode }),
			this.createActionButton("minimize", "photo_size_select_small", "ytvp-modal-minimize-button", e => { this.popup.mini = !this.popup.mini })
		];

		this.videoContainer.append(this.playerPlaceholder);
		this.player = new YT.Player(this.playerPlaceholder, this.options.playerOptions || {width: 640, height: 390, playerVars: {autoplay: 1, color: "white", showinfo: 0, iv_load_policy: 3}, events: {
			onReady: e => this.onPlayerReady(e)
		}});

		this.videoTitleEl = this.getElementsByClassName("ytvp-video-title")[0];

		this.videoTitleEl.addEventListener("click", () => {
			const t = this.player.getCurrentTime();
			if (t) this.videoTitleEl.href = `${this.videoURL}&t=${Math.floor(t)}s`;
			this.player.pauseVideo();
		});
		this.getElementsByClassName("ytvp-channel-title")[0].addEventListener("click", () => this.player.pauseVideo());

		this.resizeVideo();

	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "data-theater") {
			this.onTheaterModeChange(this.theaterMode);
			setTimeout(() => this.resizeVideo(), 500);
			setTimeout(() => this.resizeVideo(), 1200);
		}
		else if (name === "data-theme") {
			this.onThemeChange(this.theme);
		}
		else if (name === "data-top") {
			this.onInfoPositionChange(this.infoTop);
		}
		else if (name === "data-compact") {
			this.onCompactViewChange(this.compactView);
			setTimeout(() => this.resizeVideo(), 500);
			setTimeout(() => this.resizeVideo(), 1200);
		}
	}

	// video functions
	// notifyRetrieving = sets video info to "retrieving"
	loadVideo(id, notifyRetrieving = true) {
		if (!id) return;
		if (id === this.videoId) {
			this.player.playVideo();
			return;
		}
		this.videoId = id;
		this.player.loadVideoById(id, 0);

		if (notifyRetrieving) this.currentVideoInfo = this.options.retrievingInfo;

		// get full details
		if (this.options.API_KEY) {
			this.getFullVideoDetails(id).then(details => {
				this.currentVideoInfo = details;
			}).catch(err => {
				this.currentVideoInfo = this.options.defaultInfo;
				throw err;
			});
		}
		// get basic details
		else {
			this.getBasicVideoDetails(id).then(details => {
				this.currentVideoInfo = details;
			}).catch(err => {
				this.currentVideoInfo = this.options.defaultInfo;
				throw err;
			});
		}
	}
	loadVideoByURL(videoURL) {
		if (!videoURL) this.currentVideoInfo();
		this.loadVideo(this.constructor.extractVideoId(videoURL));
	}
	resetUI() {
		this.currentVideoInfo = this.options.defaultInfo;
	}
	// video title, video views, keywords, channel name
	getBasicVideoDetails(id) {
		if (!id) throw new Error("Must have a video ID to get basic video details");
		let queryURL = this.options.BASIC_URL + id;
		return new Promise((resolve, reject) => {
			fetch(queryURL).then(res => {
				res.text().then(txt => {
					const params = new URLSearchParams(txt);
					resolve({
						id, 
						title: params.get("title"),
						videoURL: this.options.WATCH_URL + id,

						channel: params.get("author"),
						views: this.constructor.formatViews(params.get("view_count"), 2)
					});
				}).catch(err => {
					throw err;
				});
			}).catch(err => {
				throw err;
			});
		});
	}
	// video title, video views, likes, dislikes, channel name, channel url
	getFullVideoDetails(id, key = this.options.API_KEY) {
		if (!id || !key) throw new Error("Must have a video ID and an API KEY to get full video details");
		return new Promise((resolve, reject) => {
			let url = this.options.VIDEO_GET + id + this.options.VIDEO_PARTS + `&key=${this.options.API_KEY}`;
			fetch(encodeURI(url)).then(response => {
			  	return response.json();
			}).then(json => {
				const snip = json.items[0].snippet;
				this.getChannelTitle(snip.channelId, key).then(channelTitle => {
					if (json.items[0] && json.items[0].snippet && json.items[0].statistics) {
						const stats = json.items[0].statistics;
						resolve({
							id,
							title: snip.title,

							videoURL: this.options.WATCH_URL + id,

							channel: channelTitle,
							channelURL: `https://www.youtube.com/channel/${snip.channelId}`,

							views: this.constructor.formatViews(stats.viewCount, 2),
							ratings: [stats.likeCount, stats.dislikeCount]
						});
					}
				  	else {
				  		reject(Error("No snippet or statistics returned."));
				  	}
				});
			}).catch(err => {
				reject(err);
			});
		});
	}
	getChannelTitle(channelId, key = this.options.API_KEY) {
		return new Promise((resolve, reject) => {
			let url = this.options.CHANNEL_GET + channelId + this.options.CHANNEL_PARTS + `&key=${this.options.API_KEY}`;
			fetch(encodeURI(url)).then(response => {
			  	return response.json();
			}).then(json => {
			  	resolve(json.items[0].snippet.title);
			}).catch(err => {
				reject(err);
			});
		});
	}
	resizeVideo(w = this.videoContainer.offsetWidth, h = this.videoContainer.offsetHeight) {
		// iframe container dimensions
		const contW = w;
		const contH = h;
		const ratio = 9 / 16;

		const playerStyles = window.getComputedStyle(this.videoContainer);
		const playerPadding = parseInt(playerStyles.getPropertyValue('--player-vertical-padding')); // get css variable

		let vidH = (contH - (contH % 9)) - (playerPadding - (playerPadding % 9));

		// get the largest dimensions that can fit in the container at the aspect ratio
		while((vidH / ratio) > contW) {
			vidH -= 9;
		}
		// 16:9 ratio = (9 / 16) = 0.5625
		this.player.setSize(vidH / ratio, vidH);
	}

	createActionButton(title, icon, customClass, click) {
		const but = document.createElement("ytvp-modal-button");

		but.innerHTML = `
			<i class="material-icons">${icon}</i>
			<p class="ytvp-tertiary-text ytvp-button-title">${title.toUpperCase()}</p>`
		;

		but.classList.add(customClass);
		but.addEventListener("click", click, true);

		this.actions.append(but);

		return but;
	}
	removeTheme() {
		this.removeAttribute("data-theme");
	}

	get theme() {
		const attr =this.getAttribute("data-theme");
		return attr !== null ? attr : null;
	}
	set theme(newTheme) {
		this.setPreference("theme", newTheme);
		this.setAttribute("data-theme", newTheme);
	}
	get infoTop() {
		return this.hasAttribute("data-top") ? true : false;
	}
	set infoTop(top) {
		this.setPreference("infoTop", top);
		top ? this.setAttribute("data-top", "") : this.removeAttribute("data-top");
	}
	get compactView() {
		return this.hasAttribute("data-compact") ? true : false;
	}
	set compactView(view) {
		this.setPreference("compactView", view);
		view ? this.setAttribute("data-compact", "") : this.removeAttribute("data-compact");
	}
	get theaterMode() {
		return this.hasAttribute("data-theater") ? true : false;
	}
	set theaterMode(mode) {
		this.setPreference("theaterMode", mode);
		mode ? this.setAttribute("data-theater", "") : this.removeAttribute("data-theater");
	}

	get mini() {
		return this.closest("s-modal").mini;
	}

	set currentVideoInfo(info) {

		if (!this.initialised) return;

		info = Object.assign({}, this.options.defaultInfo, info);

		this.videoURL = info.videoURL;

		this.videoTitle.textContent = info.title;
		this.videoTitle.href = info.videoURL;

		this.channel.textContent = info.channel;
		this.channel.href = info.channelURL;

		this.videoViews.textContent = `${info.views ? info.views : this.options.defaultInfo.views} VIEWS`;
		this.videoRatings.value = parseInt(info.ratings[0]);
		this.videoRatings.max = parseInt(info.ratings[0]) + parseInt(info.ratings[1]);
	}
	get initialised() {
		return this.player ? true : false;
	}
	get userPrefs() {
		return JSON.parse(localStorage.getItem("ytvp_prefs"));
	}

	get popup() {
		return this.closest("s-modal");
	}

	setPreference(name, value) {
		if (!name) return;
		this.preferences[name] = value;
		localStorage.setItem("ytvp_prefs", JSON.stringify(this.preferences));
	}

	// EVENTS
	onThemeChange(theme) {
		this.dispatchEvent(new CustomEvent("ThemeChange", { detail: {modal: this, theme} }));
	}
	onInfoPositionChange(top) {
		this.dispatchEvent(new CustomEvent("InfoPositionChange", { detail: {modal: this, top} }));
	}
	onTheaterModeChange(mode) {
		this.dispatchEvent(new CustomEvent("TheaterModeChange", { detail: {modal: this, mode} }));
	}
	onCompactViewChange(view) {
		this.dispatchEvent(new CustomEvent("CompactViewChange", { detail: {modal: this, view} }));
	}
	onPlayerReady() {
		this.dispatchEvent(new CustomEvent("PlayerReady", { detail: this }));
	}

}

customElements.define("ytvp-modal", YTVPModal);