// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide
// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide
// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide

document.head.innerHTML += "<link rel='stylesheet' href='https://fonts.googleapis.com/icon?family=Material+Icons'></link>";

class YTVP {

	static get defaultOptions() {
		return {

			API_KEY: null,
			videoInfoApi: "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&fields=items(snippet(title,channelId),statistics(viewCount,likeCount,dislikeCount))",
			channelInfoApi: "https://www.googleapis.com/youtube/v3/channels?part=snippet&fields=items(snippet/title)",

			enabled: true,

			// settings for detecting which version of youtube the user is on (material or old)
			designWaitMaxTries: 20,
			designWaitInterval: 500,

			// detect current youtube design (material or old)
			materialSelector: "ytd-app",
			oldSelector: "#early-body",

			// get the id of the video eg. (youtube.com/watch?v=ID)
			materialIdSelector: "#thumbnail",
			oldIdSelectors: "a.yt-uix-sessionlink.spf-link, .lohp-video-link",

			// video types for the new youtube design
			materialVideoTypes: ["ytd-video-renderer", "ytd-grid-video-renderer", "ytd-compact-video-renderer", "ytd-playlist-video-renderer", "ytd-playlist-panel-video-renderer", "ytd-newspaper-hero-video-renderer", "ytd-newspaper-mini-video-renderer"],

			// video types for the old youtube design
			oldVideoTypes: [".expanded-shelf-content-item-wrapper", ".yt-shelf-grid-item", ".video-list-item.related-list-item", ".pl-video", ".yt-uix-scroller-scroll-unit", ".yt-lockup.yt-lockup-tile.yt-lockup-video.clearfix", ".lohp-large-shelf-container", ".lohp-medium-shelf"],

		};
	}
	static log(msg, prefix = "YTVP") {
		if (!msg || !prefix) return;
		console.info(`[ %c${prefix} %c] %c${msg}`, "color: blue", "", "color: green");
	}

	constructor(options) {
		this.constructor.log("Starting..");
		this.options = Object.assign({}, this.constructor.defaultOptions, options);

		this.initialised = false;

		// stop thumbnail clicks from going to a video and open popup instead
		// document.addEventListener("click", (e) => {this.handleThumbnailClick(e)}, true);
	}

	createModal(ytplayer) {
		this.popup = document.createElement("s-modal");
		this.modal = document.createElement("ytvp-modal");
		this.modal.init(YT, this.options.API_KEY);

		this.popup.closeOptions = ["escape", "click"];

		this.popup.dialog.append(this.modal);

		document.body.prepend(this.popup);

		// this.popup.addEventListener("ModalOpened", e => {this.modal.resizeVideo()});
		this.popup.addEventListener("ModalOpened", e => {this.popup.resizeModalVideo()});

		this.modal.addEventListener("PlayerReady", e => {
			this.initialised = true;
			this.constructor.log("Fully initialised and ready! :)");
		});

		window.addEventListener("resize", () => this.popup.resizeModalVideo());

	}
	waitForDesign() {
		return new Promise((resolve, reject) => {
			let tries = 0;
			const wfd = setInterval(() => {
				tries++;
				if (tries > this.options.designWaitMaxTries) {
					reject(new Error("YTVP couldn\'t detect the current youtube design."));
				}
				// old design
				if (document.querySelector(this.options.oldSelector)) {
					this.currentDesign = "old";
					resolve("old");
					clearInterval(wfd);
				}
				// material design
				else if (document.querySelector(this.options.materialSelector)) {
					this.currentDesign = "material";
					resolve("material");
					clearInterval(wfd);
				}
			}, 500);
		});
	}
	getVideoURL(video) {
		if (!video || !video.querySelector) return false;

		let materialId = video.querySelector(this.options.materialIdSelector)
		let oldId = video.querySelector(this.options.oldIdSelectors);

		if (materialId && materialId.href) return materialId.href;
		else if (oldId && oldId.href) return oldId.href;

		// can't get video id
		// alert("YTVP was unable to retrieve the video\'s URL :/");
		throw new Error("YTVP was unable to retrieve the video\'s URL :/");
	}
	getMaterialVideo(target) {
		if (!target) return false;
		for (let videoType of this.options.materialVideoTypes) {
			let video = target.closest(videoType);
			if (target.closest(videoType)) return video;
		}
		return false;
	}
	getOldVideo(target) {
		if (!target) return false;
		for (let videoType of this.options.oldVideoTypes) {
			let video = target.closest(videoType);
			if (video) return video;
		}
		return false;
	}

	handleThumbnailClick(e) {
		if (!this.initialised) return;
		const target = e.target;

		if (!target.classList.contains("yt-uix-tooltip") && !target.classList.contains("ytd-thumbnail-overlay-toggle-button-renderer") && !target.classList.contains("spf-link")) {

			const video = this.getMaterialVideo(target) || this.getOldVideo(target);
			const videoURL = this.getVideoURL(video);

			// if the target clicked on is a video thumbnail and not text or a video button (watch later)
			if ( ((target.closest("ytd-thumbnail") || target.closest("#thumbnail-container") || this.currentDesign === "old") && video && videoURL)) {
				e.stopImmediatePropagation();
				e.preventDefault();

				// modal automatically extracts id thanks to
				// https://github.com/ngzhian/quickview-chrome/blob/54fcc396d6d7fe6c964f9d014e2d08ac7c28ecb4/qv.js#L41
				this.popup.open();
				this.modal.loadVideoByURL(videoURL);
			}

		}
	}

}

const ytvp = new YTVP({enabled: true, API_KEY: "AIzaSyBBdCo-KyDeWBHkR2JrGdeL7tyrMq3z1-4"});
document.addEventListener("click", (e) => {
	if (ytvp.initialised) {
		ytvp.handleThumbnailClick(e);
	}
	else  {
		e.stopImmediatePropagation();
		e.preventDefault();
	}
}, true);
// const ytvp = new YTVP({enabled: true});

function onYouTubeIframeAPIReady() {

	YTVP.log("Youtube IFrame API Ready..");

	ytvp.waitForDesign().then(design => {
		YTVP.log("Current design: " + design);
		ytvp.createModal(YT, ytvp.options.API_KEY);
	}).catch(err => {
		throw err;
	});

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("rtololol");
	console.log(request, request.message);

	if (request.message === "optionChange") {

		ytvp.modal.theme = request.data.theme;
		ytvp.modal.infoTop = (request.data.infopos === "bottom" ? false : true);
 		
		if (request.data.christmas) {ytvp.popup.setAttribute("data-christmas", true);}
		else {ytvp.popup.removeAttribute("data-christmas");}

		if (request.data.compact) {ytvp.modal.compactView = true;}
		else {ytvp.modal.compactView = false;}

 	}
});