// https://github.com/ngzhian/quickview-chrome/blob/master/qv.js as a guide
document.addEventListener("iv_oauth_denied", () => {
	console.log("OAuth was denied");
});

const ivoptions = {
    // settings for detecting which version of youtube the user is on (material or old)
    designWaitMaxTries: 20,
    designWaitInterval: 500,

    // detect current youtube design (material or old)
    materialSelector: "ytd-app",
    oldSelector: "#early-body",

    // get the id of the video eg. (youtube.com/watch?v=ID)
    materialIdSelector: "a#thumbnail",
    oldIdSelectors: "a.yt-uix-sessionlink.spf-link, .lohp-video-link",

    // video types for the new youtube design
    materialVideoTypes: [
        "ytd-video-renderer", "ytd-grid-video-renderer", 
        "ytd-grid-radio-renderer", "ytd-compact-video-renderer", 
        "ytd-playlist-video-renderer", "ytd-playlist-panel-video-renderer", 
        "ytd-newspaper-hero-video-renderer", "ytd-newspaper-mini-video-renderer", 
        "ytd-playlist-thumbnail", "ytd-rich-grid-video-renderer"
    ],

    // video types for the old youtube design
    oldVideoTypes: [
        ".expanded-shelf-content-item-wrapper", ".yt-shelf-grid-item", 
        ".video-list-item.related-list-item", ".pl-video", 
        ".yt-uix-scroller-scroll-unit", 
        ".yt-lockup.yt-lockup-tile.yt-lockup-video.clearfix", 
        ".lohp-large-shelf-container", ".lohp-medium-shelf"
    ]
};

// helper functions
function ivlog(msg, prefix = "IV") {
    if (!msg || !prefix) {
        return;
    }
    console.info(`[ %c${prefix} %c] %c${msg}`, "color: blue", "", "color: green");
}
function extractVideoID(videoURL) {
    if (!videoURL) {
        return;
    }
    if (videoURL.includes("watch_videos?")) {
    	const params = new URL(videoURL).searchParams;
    	const ids = params.get("video_ids");
    	if (ids) {
    		const idsSplit = ids.split(",");
    		if (idsSplit.length) {
    			return idsSplit;
    		}
    	}
    }
    return new URL(videoURL).searchParams.get("v");
}

function waitForDesign() {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const wfd = setInterval(() => {
            tries++;
            if (tries > ivoptions.designWaitMaxTries) {
                reject(new Error("IV couldn\'t detect the current youtube design."));
            }
            // old design
            if (document.querySelector(ivoptions.oldSelector)) {
                instantview.design = "old";
                resolve("old");
                clearInterval(wfd);
            }
            // material design
            else if (document.querySelector(ivoptions.materialSelector)) {
                instantview.design = "material";
                resolve("material");
                clearInterval(wfd);
            }
        }, 500);
    });
}

function getVideoURL(video) {
    if (!video || !video.querySelector) {
        return false;
    }

    let materialId = video.querySelector(ivoptions.materialIdSelector)
    let oldId = video.querySelector(ivoptions.oldIdSelectors);

    if (materialId && materialId.href) {
        return materialId.href;
    }
    else if (oldId && oldId.href) {
        return oldId.href;
    }

    // can't get video id
    throw new Error("Unable to retrieve the video\'s URL :/");
}
function getMaterialVideo(target) {
    if (!target) {
        return false;
    }
    for (let videoType of ivoptions.materialVideoTypes) {
        let video = target.closest(videoType);
        if (target.closest(videoType)) {
            return video;
        }
    }
    return false;
}
function getOldVideo(target) {
    if (!target) {
        return false;
    }
    for (let videoType of ivoptions.oldVideoTypes) {
        let video = target.closest(videoType);
        if (video) {
            return video;
        }
    }
    return false;
}

function handleThumbnailClick(e) {
    const target = e.target;

    const filterSelector = ".yt-uix-tooltip, .ytd-thumbnail-overlay-toggle-button-renderer, .spf-link, .title, h1, h2, h3, h4, h5, h6, span, li";

    if (
        !target.matches(filterSelector) ||
        target.closest("ytd-playlist-thumbnail") ||
        target.closest("ytd-grid-radio-renderer") || target.closest("ytd-radio-renderer")) {

        const video = getMaterialVideo(target) || getOldVideo(target);
        let videoURL = getVideoURL(video);

        const mod = instantview.modifier;
        // make sure the to only activate if the modifier is met
        if (!mod || mod === "none" || ( (mod === "shift" && e.shiftKey) || (mod === "alt" && e.altKey) || (mod === "ctrl" && e.ctrlKey)) ) {
            // if the target clicked on is a video thumbnail and not text or a video button (watch later)
            if (instantview.ready && ((target.closest("ytd-thumbnail") || target.closest("ytd-playlist-thumbnail") || target.closest("#thumbnail-container") || instantview.design === "old") && video && videoURL)) {

                e.stopImmediatePropagation();
                e.preventDefault();

                let videoID = extractVideoID(videoURL);

                if (Array.isArray(videoID)) {
            	    const parent = target.closest("#items.yt-horizontal-list-renderer");

				    if (parent) {
				    	const parentChildren = parent.children;
				    	for (let i = 0; i < parentChildren.length; i++) {
				    		const child = parentChildren[i];

				    		const targetTitle = video.querySelector("#video-title").title;
				    		const childTitle = child.querySelector("#video-title").title;

				    		if (targetTitle === childTitle) {
				    			videoID = videoID[i];
				    		}
				    	}
				    }
                }

                if (videoID) {
                	const list = new URL(videoURL).searchParams.get("list");

                	if (list) {
                		// instantview.videoDataActions.loadPlaylist(videoID, list);
                		const currentList = new URL(instantview.player.getVideoUrl()).searchParams.get("list");
                        const currentID = instantview.store.getState().videoData.videoId;

                		if (currentList !== list) {
                			instantview.player.stopVideo();
	                		instantview.player.loadPlaylist({
	                			list,
	                			listType: "playlist",
	                			index: 0
	                		});
	                		instantview.clickedVideoID = videoID;
	                	}
                        else if (videoID !== currentID && currentList === list) {
                        	const playlistIds = instantview.player.getPlaylist();
                        	const vidIndex = findPlaylistIdIndex(playlistIds, videoID);
                        	if (vidIndex !== -1) {
                        		instantview.player.playVideoAt(vidIndex);
                        	}
                        	else {
                                // Stopping causes duplicate video data requests
                                // since stopping the video sends out a state change
                                // event with a code of -1 which we use to load new video
                                // data
                        		// instantview.player.stopVideo();
                				instantview.player.loadVideoById(videoID);
                        	}
                        }
                	}
                	else {
                		if (instantview.store.getState().videoData.videoId !== videoID) {
                            // Stopping causes duplicate video data requests
                            // since stopping the video sends out a state change
                            // event with a code of -1 which we use to load new video
                            // data
                            // instantview.player.stopVideo();
                			instantview.player.loadVideoById(videoID);
                		}
                	}

                    if (!instantview.store.getState().state.modalOpen) {
                        instantview.store.dispatch(instantview.stateActions.openModal(instantview.playedFirstVideo));
                    }

                    if (!instantview.playedFirstVideo) {
                        instantview.playedFirstVideo = true;
                    }
            	}
            }
            else if (!instantview.ready && ((target.closest("ytd-thumbnail") || target.closest("#thumbnail-container") || instantview.design === "old") && video && videoURL)) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    }
}

function findPlaylistIdIndex(playlistIds, videoId) {
    for (let i = 0; i < playlistIds.length; i++) {
        let indexId = playlistIds[i];
        if (indexId === videoId) {
            return i;
        }
    }
    return -1;
}

// preference handling

function getUserPrefs() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("iv_options", function(items) {
            if (items && items.iv_options) {
                resolve(JSON.parse(items.iv_options));
            }
            else {
                reject("Items object doesn\'t exist");
            }
        });
    });
}

function reloadUserPrefs() {
    return new Promise((resolve, reject) => {

        getUserPrefs().then(prefs => {
            const state = instantview.store.getState();

            const mp = state.options.miniPosition;
            if (mp !== prefs.miniPosition) {
                instantview.modal.style.removeProperty("left");
                instantview.modal.style.removeProperty("top");

                instantview.customLeft = null;
                instantview.customTop = null;
            }

            instantview.store.dispatch(instantview.optionsActions.setOptions({
                theme: prefs.theme || "light",
                infoTop: prefs.infoPosition === "top" ? true : false,
                miniPosition: prefs.miniPosition,
                miniSize: prefs.miniSize,
                miniDefault: prefs.miniDefault,
                dataSource: prefs.dataSource,

                showDate: prefs.showDate,

                customColors: prefs.customColorsEnabled,
                customPrimary: prefs.primaryColor,
                customSecondary: prefs.secondaryColor,
                animationSpeed: prefs.animationSpeed,
                fftSize: prefs.fftSize,

                overlayedVisualizer: prefs.overlayMode,
                overlayOpacity: prefs.overlayOpacity,
                backdropOpacity: prefs.backdropOpacity,
                backdropColor: prefs.backdropColor,

                titleCentered: prefs.titleCenterEnabled,
                commentBorders: prefs.commentBorders,
                commentSpacing: prefs.commentSpacing,
                commentSeparation: prefs.commentSeparation
            }));

            const animationSpeed = parseInt(prefs.animationSpeed, 10);
            instantview.animationSpeed = Math.max(1, animationSpeed) || 90;

            if (prefs.customColorsEnabled) {
                instantview.visPrimaryColor = prefs.primaryColor;
                instantview.visSecondaryColor = prefs.secondaryColor;
            }
            else {
                if (prefs.theme === "dark" || prefs.theme === "halloween" || prefs.theme === "gray") {
                    instantview.visPrimaryColor = instantview.visBlue;
                    instantview.visSecondaryColor = instantview.visGreen;
                }
                else {
                    instantview.visPrimaryColor = instantview.visPink;
                    instantview.visSecondaryColor = instantview.visBlack;
                }
            }

            instantview.modifier = prefs.clickModifier;

            if (state.options.miniSize !== prefs.miniSize) {
                const videoContainer = document.getElementById("iv-video-container");
                videoContainer.resizeHandler(videoContainer);
            }

            if (state.options.dataSource !== prefs.dataSource) {
                chrome.runtime.sendMessage({
                    message: "change_data_source",
                    dataSource: prefs.dataSource
                });
            }

            if (instantview.ready && state.options.fftSize !== prefs.fftSize) {
                instantview.analyzer.fftSize = prefs.fftSize;
            }

            const ab = document.querySelector("#iv-minimize-button svg").style;

            if (prefs.miniPosition === "br") {
                ab.transform = "";
            }
            else if (prefs.miniPosition === "bl") {
                ab.transform = "rotateY(180deg)";
            }
            else if (prefs.miniPosition === "tl") {
                ab.transform = "rotateX(180deg)";
            }
            else if (prefs.miniPosition === "tr") {
                ab.transform = "rotate(180deg)";
            }

            resolve();

        }).catch(e => {
            // defaults should be set when the user first opens the options page
            resolve(e);
        });

    });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    reloadUserPrefs();
});

document.addEventListener("click", e => {
    handleThumbnailClick(e);
}, true);

document.addEventListener("iv_iframe_api_ready", () => {
    if (document.__startedInstantView) {
        return;
    }
    
    document.__startedInstantView = true;
    ivlog(`Starting InstantView version ${chrome.runtime.getManifest().version}`);
    ivlog("Youtube IFrame API ready");

    instantview.getUserPrefs = getUserPrefs;
    instantview.reloadUserPrefs = reloadUserPrefs;

    waitForDesign().then(design => {
        ivlog("Current design: " + design);
        instantview.playedFirstVideo = false;

        instantview.player.addEventListener("onStateChange", handlePlayerStateChange);

        reloadUserPrefs().then(() => {

            if (instantview.store.getState().options.miniDefault) {
                instantview.store.dispatch({type: "MINIMIZE_MODAL_CLOSED"});
                const videoContainer = document.getElementById("iv-video-container");
                videoContainer.resizeHandler(videoContainer);
            }
            window.instantview.ready = true;

            const prefs = instantview.store.getState().options;
            instantview.analyzer.fftSize = prefs.fftSize;
        }).catch(e => {
            // defaults should be set when the user first opens the options page
            throw e;
        });

        // allow registering of key events even when
        // the player iframe has focus
        window.addEventListener("keydown", e => {
            handleKeyPress(e);
        });
        instantview.iframeDoc.addEventListener("keydown", e => {
            handleKeyPress(e);
        });

    }).catch(err => {
        throw err;
    });
});

function handlePlayerStateChange(e) {
	if (e.data === -1) {
		const videoID = new URL(instantview.player.getVideoUrl()).searchParams.get("v");
        const currentID = instantview.store.getState().videoData.videoId;

        const playlistIds = instantview.player.getPlaylist();
        const clickedID = instantview.clickedVideoID;
        if (playlistIds && playlistIds.length && clickedID && videoID && videoID !== clickedID) {
        	const vidIndex = findPlaylistIdIndex(playlistIds, clickedID);
        	if (vidIndex !== -1) {
        		instantview.player.playVideoAt(vidIndex);
        	}
        	else {
        		instantview.player.stopVideo();
				instantview.player.loadVideoById(clickedID);
        	}
        	instantview.clickedVideoID = null;
        }
        else if (currentID !== videoID) {
            instantview.videoDataActions.updateVideoData(videoID, false);
            instantview.clickedVideoID = null;
        }
	}
}

function handleKeyPress(e) {
    const key = e.key;
    const state = instantview.store.getState().state;
    // if the escape key is pressed
    if (state.modalOpen && !state.modalAnimating && key === "Escape") {
        e.preventDefault();

        if (!instantview.dragging) {
            if (state.minimized) {
                instantview.store.dispatch(instantview.stateActions.maximizeModal());
            }
            else {
                instantview.store.dispatch(instantview.stateActions.closeModal());
            }
        }
    }
}

// handle commands (play, pause, stop, prev, next)
chrome.runtime.onMessage.addListener(request => {

    const modalState = instantview.store.getState().state;

    if (!modalState.modalOpen || modalState.modalAnimating) {
        return;
    }

    if (request === "instantview-video-play-pause") {
        const playerState = instantview.player.getPlayerState();
        if (playerState === 1) {
            instantview.player.pauseVideo();
        }
        else if (playerState === 2) {
            instantview.player.playVideo();
        }
    }
    else if (request === "instantview-video-next") {
        instantview.player.nextVideo();
    }
    else if (request === "instantview-video-previous") {
        instantview.player.previousVideo();
    }
    else if (request === "instantview-video-stop") {
        instantview.player.stopVideo();
    }
});