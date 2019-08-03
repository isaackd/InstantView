const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import "./VideoContainer.scss";

import * as stateActions from "../actions/stateActions.js";

import svgload from "../libs/svgload.js";
import CloseIcon from "../../icons/close.svg";
import MaximizeIcon from "../../icons/maximize.svg";
import MoveIcon from "../../icons/move_handle.svg";

import store from "../store.js";

const VideoContainer = (store, modal) => {
    const base = document.createElement("div");
    base.setAttribute("id", "iv-video-container");

    const miniCloseButton = svgload(CloseIcon);
    miniCloseButton.setAttribute("id", "iv-mini-close");
    miniCloseButton.addEventListener("click", () => {
        store.dispatch(stateActions.closeModal());
    });

    const miniMaximizeButton = svgload(MaximizeIcon);
    miniMaximizeButton.setAttribute("id", "iv-mini-maximize");
    miniMaximizeButton.addEventListener("click", () => {
        store.dispatch(stateActions.maximizeModal());
    });

    const miniMoveButton = svgload(MoveIcon);
    miniMoveButton.setAttribute("id", "iv-mini-move");
    dragElement(modal, miniMoveButton);

    const playerWrapper = document.createElement("div");
    playerWrapper.setAttribute("id", "iv-player-wrapper");

    playerWrapper.append(miniCloseButton, miniMaximizeButton, miniMoveButton);
    base.append(playerWrapper);

    initRO(base, playerWrapper);

    base.resizeHandler = resizeHandler;

    base.onPlayerReady = onPlayerReady;

    return base;
}

function initRO(videoContainer, el) {
    const ro = new ResizeObserver(entries => {
        if (!store.getState().state.minimized) resizeHandler(videoContainer);
    });
    ro.observe(videoContainer);

    window.addEventListener("resize", e => {
        if (store.getState().state.minimized) resizeHandler(videoContainer);
    });

    if (!instantview.player) {
        initPlayer(el);
    }
}

function bringMiniIntoBounds() {

    const modal = instantview.modal;

    if (modal.style.left && modal.style.top) {
        const elRect = modal.getBoundingClientRect();

        const topRight = elRect.x + elRect.width;
        const bottomRight = elRect.y + elRect.height;

        if (elRect.x < 0) {
            modal.style.left = "0vw";
        }
        else if (topRight > window.innerWidth) {
            const vw = window.innerWidth * 0.01;
            const fX = (window.innerWidth - elRect.width) / vw;
            modal.style.left = fX + "vw";
        }

        if (elRect.y < 0) {
            modal.style.top = "0.0vw";
        }
        else if (bottomRight > window.innerHeight) {
            const vh = window.innerHeight * 0.01;
            const fY = (window.innerHeight - elRect.height) / vh;
            modal.style.top = fY + "vh";
        }

    }
}

function resizeHandler(el) {
    const state = store.getState().state;
    if (!state.minimized) {
        handleResize(el);
    }
    else {
        let multiplier = 0.20;
        if (instantview.modal.hasAttribute("data-minisize")) {
            const floatVal = parseFloat(instantview.modal.getAttribute("data-minisize"));
            if (floatVal >= 10 && floatVal <= 30) {
                multiplier = floatVal / 100;
                instantview.modal.style.setProperty("--iv-mini-width-multiplier", multiplier);
            }
        }

        handleResize(el, window.innerWidth * multiplier, window.innerHeight);

        const modal = instantview.modal;
        bringMiniIntoBounds();
    }
}

function handleResize(el, width, height) {
    
    width = width || el.offsetWidth;
    height = height || el.offsetHeight;

    let verticalPadding = 30;
    if (el.hasAttribute("data-mini")) verticalPadding = 0;

    // subtract whatever vertical padding we want (element is centered so top == bottom)
    height -= verticalPadding;
    // 16 by 9 ratio
    const ratio = Math.min(width / 16, height / 9);
    // set the width and height of the iframe
    // minimum width = 512, minimum height = 256
    // desired width and height
    const desW = Math.floor(16 * ratio);
    const desH = Math.floor(9 * ratio);

    instantview.player.setSize(desW, desH);
}

function loadVideo(id) {
    if (id && (!instantview.player || !instantview.player.loadVideoById)) {
        // make sure the player is loader
        // if not, check again in 500ms
        const queueVideoInterval = setInterval(() => {
            if (instantview.player && instantview.player.loadVideoById) {
                instantview.player.loadVideoById(id);
                clearInterval(queueVideoInterval);
            }
        }, 500);
    }
    else if (id) instantview.player.loadVideoById(id);
}

function initPlayer(el) {

    const overlayed = instantview.store.getState().options.overlayedVisualizer;
    const playerPlaceholder = document.createElement("div");
    el.append(playerPlaceholder);

    instantview.player = new YT.Player(playerPlaceholder, {
        width: 640, 
        height: 390, 
        playerVars: {autoplay: 1, iv_load_policy: 3},
        events: {
            onReady:  onPlayerReady
        }
    });
}

async function onPlayerReady() {
    if (!instantview.initializedAudio && !document.initializedInstantViewAudio) {

        let media;

        if (mode === prod) {
            const vidContainer = document.getElementById("iv-video-container");
            const iframe = vidContainer.getElementsByTagName("iframe")[0] || vidContainer.player.a;

            iframe.setAttribute("allow", "autoplay");
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const HTML5VidContainer = iframeDoc.querySelector(".html5-video-player.ytp-embed");
            const vid = iframeDoc.querySelector("video.html5-main-video");

            // for some reason onPlayerReady is being called twice
            // I think it's because youtube loads its own version of the iframe API
            // so onReady is called twice
            // this is a workaround until I can fix the actual issue
            if (vid) {
                instantview.initializedAudio = true;
                document.initializedInstantViewAudio = true;
                instantview.player.addEventListener("onStateChange", e => {
                    // pause the video if the modal is closed by the time it loads
                    if (e.data === 1 && !instantview.store.getState().state.modalOpen) {
                        instantview.player.pauseVideo();
                    }
                });
            }
            else {
                return;
            }

            // HTML5VidContainer.classList.remove("ytp-hide-info-bar");

            instantview.iframeDoc = iframeDoc;

            document.dispatchEvent(new Event("iv_iframe_api_ready"));

            const videoTop = iframeDoc.querySelector(".ytp-chrome-top");

            const videoTitle = iframeDoc.querySelector(".ytp-title");
            const videoButtons = iframeDoc.querySelector(".ytp-chrome-top-buttons");
            const pauseOverlay = iframeDoc.querySelector(".ytp-pause-overlay");

            const playlistMenu = iframeDoc.querySelector(".ytp-playlist-menu");
            const playlistMenuButton = iframeDoc.querySelector(".ytp-playlist-menu-button");
            if (playlistMenuButton) {
                playlistMenuButton.style.position = "absolute";
                playlistMenuButton.style.left = "0";
            }

            const observer = new MutationObserver(mutations => {
                for (const mutationRecord of mutations) {
                    if (instantview.store.getState().state.minimized) {
                        const newDisplay = playlistMenu.style.display;

                        if (newDisplay === "none") {
                            const icons = document.querySelectorAll("#iv-player-wrapper > svg");
                            for (const icon of icons) {
                                icon.style.removeProperty("display");
                            }
                        }
                        else {
                            const icons = document.querySelectorAll("#iv-player-wrapper > svg");
                            for (const icon of icons) {
                                icon.style.display = "none";
                            }
                        }
                    }
                }  
            });

            observer.observe(playlistMenu, { attributes : true, attributeFilter : ["style"] });

            videoTitle.remove();
            // videoButtons.remove();

            const annoyingButtons = iframeDoc.querySelectorAll(".ytp-watch-later-button, .ytp-share-button");
            for (const ab of annoyingButtons) {
                ab.remove();
            }

            pauseOverlay.remove();

            media = vid;
        }
        else {
            const src = await import("../../audio/test.mp3");
            const aud = new Audio(src.default);
            aud.setAttribute("controls", "true");
            document.body.append(aud);
            media = aud;
        }

        instantview.visualizer.setupAudio(media);

        instantview.analyzer = instantview.visualizer.analyzer;
    }
}

function dragElement(element, handle) {
    if (!element) throw new Error("An element must be provided to drag");
    if (!handle) handle = element;

    handle.onmousedown = dragStart;

    const startingPos = {x: 0, y: 0};
    const startingMousePos = {x: 0, y: 0};

    const newPos = {x: 0, y: 0};

    function dragStart(e) {

        instantview.dragging = true;

        document.onmousemove = drag;
        document.onmouseup = dragEnd;

        const elRect = element.getBoundingClientRect();

        startingPos.x = elRect.x;
        startingPos.y = elRect.y;

        startingMousePos.x = e.clientX;
        startingMousePos.y = e.clientY;

        const modal = document.getElementById("iv-modal");
        const iframe = modal.querySelector("#iv-video-container iframe");
        iframe.style.visibility = "hidden";

        modal.style.backgroundColor = "black";
    }

    function drag(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const elRect = element.getBoundingClientRect();

        const relativeX = Math.max(-startingPos.x, Math.min((window.innerWidth - elRect.width) - startingPos.x, mouseX - startingMousePos.x));
        const relativeY = Math.max(-startingPos.y, Math.min((window.innerHeight - elRect.height) - startingPos.y, mouseY - startingMousePos.y));

        newPos.x = startingPos.x + relativeX;
        newPos.y = startingPos.y + relativeY;

        element.style.setProperty("transform", `translate(${relativeX}px, ${relativeY}px)`);
    }

    function dragEnd(e) {
        document.onmousedown = null;
        document.onmouseup = null;
        document.onmousemove = null;

        const vw = window.innerWidth * 0.01;
        const vh = window.innerHeight * 0.01;

        element.style.removeProperty("transform");

        const vx = newPos.x / vw;
        const vy = newPos.y / vh;

        element.style.setProperty("left", `${vx}vw`);
        element.style.setProperty("top", `${vy}vh`);

        const modal = document.getElementById("iv-modal");
        const iframe = modal.querySelector("#iv-video-container iframe");
        iframe.style.visibility = "visible";
        modal.style.backgroundColor = "transparent";

        // set a variable in the instantview namespace so we can 
        // set it back when the modal is minimized again
        instantview.customLeft = vx;
        instantview.customTop = vy;

        instantview.dragging = false;

    }
}

export default VideoContainer;