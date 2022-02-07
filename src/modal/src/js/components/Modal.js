import "./Modal.css";

import Snackbar from "./Snackbar.js";

import * as stateActions from "../actions/stateActions.js";

import Panels from "./Panels.js";

const themes = ["Light", "Dark", "Gray"];

const Modal = (store) => {
    const data = store.getState();
	const options = data.options;

    const base = document.createElement("div");
    base.setAttribute("id", "iv-modal");
    base.setAttribute("data-theme", options.theme);

    /// #if BROWSER === "firefox"

    base.setAttribute("data-browser", "firefox");

    /// #endif

    store.subscribe(() => {
        modalDataSync(store, base);
    });
    modalDataSync(store, base);

    const backdrop = document.createElement("div");
    backdrop.setAttribute("id", "iv-backdrop");
    backdrop.addEventListener("click", () => {
        store.dispatch(stateActions.closeModal());
    });

    const panels = Panels(store, base);

    base.append(backdrop, panels, Snackbar);
    return base;
};

let originalTabTitle = document.title;

new MutationObserver(mutations => {
    if (instantview.store) {
        const videoData = instantview.store.getState().videoData;
        if (document.title !== `${videoData.videoTitle} - (InstantView)`) {
            originalTabTitle = document.title;
        }
    }
}).observe(
    document.querySelector("title"),
    { subtree: true, characterData: true, childList: true }
);

function modalDataSync(store, base) {
    const data = store.getState();
    const state = data.state;
    const options = data.options;
    const videoData = data.videoData;

    // set the tab title to the video title
    if (state.modalOpen && videoData.videoTitle && document.title !== `${videoData.videoTitle} - (InstantView)`) {
        document.title = `${videoData.videoTitle} - (InstantView)`;
    }
    else if (!state.modalOpen && videoData.videoTitle) {
        document.title = originalTabTitle;
    }

    const likes = videoData.videoLikes;
    const dislikes = videoData.videoDislikes;

    if (instantview.modal) {
        const percentage = (likes !== null && dislikes !== null && likes >= 0 && dislikes >= 0) ?
        Math.round(likes / (likes + dislikes) * 100) :
        0;

        instantview.modal.style.setProperty("--iv-ratings-likes-percent", percentage + "%");
    }

    if (state.visualizerOpen) {
        base.setAttribute("data-visualizer", "");
    }
    else {
        base.removeAttribute("data-visualizer");
    }

    if (state.commentsOpen) {
        base.setAttribute("data-comments", "");
    }
    else {
        base.removeAttribute("data-comments");
    }

    if (state.minimized) {
        base.setAttribute("data-mini", options.miniPosition || "");
    }
    else {
        base.removeAttribute("data-mini");
    }

    if (options.showDate !== "off") {
        base.setAttribute("data-showdate", options.showDate || "top");
    }
    else if (options.showDate === "off") {
        base.removeAttribute("data-showdate");
    }

    if (options.infoTop) {
        base.setAttribute("data-infotop", "");
    }
    else {
        base.removeAttribute("data-infotop");
    }

    if (options.miniSize) {
        base.setAttribute("data-minisize", options.miniSize);
    }

    setTheme(base, options);

    if (videoData.videoRating) {
        base.setAttribute("data-rating", videoData.videoRating);
    }
    else {
        base.removeAttribute("data-rating");
    }

    if (options.titleCentered) {
        base.setAttribute("data-title-centered", "");
    }
    else {
        base.removeAttribute("data-title-centered");
    }

    if (options.commentBorders) {
        base.setAttribute("data-comment-borders", "");
    }
    else {
        base.removeAttribute("data-comment-borders");
    }

    if (options.commentSpacing) {
        base.setAttribute("data-comment-spacing", "");
    }
    else {
        base.removeAttribute("data-comment-spacing");
    }

    if (options.commentSeparation) {
        base.setAttribute("data-comment-separation", "");
    }
    else {
        base.removeAttribute("data-comment-separation");
    }

    if (instantview.modal && options.overlayOpacity) {
        instantview.modal.style.setProperty("--iv-overlay-vis-opacity", options.overlayOpacity);
    }

    if (instantview.modal && options.backdropOpacity) {
        const color = options.backdropColor;
        const opacityToHex = (Math.floor(options.backdropOpacity * 255)).toString(16);
        instantview.modal.style.setProperty("--iv-backdrop-vis-color", color + opacityToHex);
    }

    if (instantview.modal && options.backdropColor) {
        const color = options.backdropColor;
        const opacityToHex = (Math.floor(options.backdropOpacity * 255)).toString(16);
        instantview.modal.style.setProperty("--iv-backdrop-vis-color", color + opacityToHex);
    }

    const visualizer = document.getElementById("iv-visualizer");

    if (visualizer) {
        if (options.overlayedVisualizer && visualizer.parentNode.matches("#iv-panels")) {
            changeOverlayMode(true);
        }
        else if (!options.overlayedVisualizer && visualizer.parentNode.matches("#iv-player-wrapper")) {
            changeOverlayMode(false);
        }
    }
}

function setTheme(base, options) {
    const currentTheme = options.theme;
    for (const theme of themes) {
        if (currentTheme === theme.toLowerCase()) {
            base.setAttribute("data-theme", currentTheme);
            return;
        }
    }

    instantview.getUserPrefs().then(prefs => {
        const newOptions = Object.assign(prefs, {theme: "light"});
        chrome.storage.local.set({iv_options: JSON.stringify(newOptions)}, function() {
            // data is saved
        });
    }).catch(e => {
        throw e;
    });
}

function changeOverlayMode(overlayed) {

    instantview.log(`Changing overlay mode to ${overlayed}`);

    const panels = document.getElementById("iv-panels");
    const wrapper = document.getElementById("iv-player-wrapper");

    const vis = document.getElementById("iv-visualizer");

    if (overlayed) {
        wrapper.prepend(vis);
        instantview.modal.setAttribute("data-overlayed-vis", "");
    }
    else {
        panels.append(vis);
        instantview.modal.removeAttribute("data-overlayed-vis");
    }
}

export default Modal;
