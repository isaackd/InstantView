import "./VideoPanel.css";

import VideoContainer from "./VideoContainer.js";
import VideoActions from "./VideoActions";

import watch from "redux-watch";

const VideoPanel = (store, modal) => {
    const base = document.createElement("div");
    base.setAttribute("id", "iv-video-panel");

    base.append(VideoContainer(store, modal), VideoInfo(store), VideoActions(store));
    return base;
};

const VideoInfo = (store, modal) => {
    const base = document.createElement("div");
    base.setAttribute("id", "iv-video-info");

    const titleWrapper = document.createElement("div");
    titleWrapper.setAttribute("id", "iv-video-title-wrapper");

    const videoTitle = document.createElement("a");
    videoTitle.classList.add("iv-video-title");
    videoTitle.setAttribute("target", "_blank");
    videoTitle.setAttribute("rel", "noopener");
    videoTitle.setAttribute("title", "N/A");

    videoTitle.addEventListener("click", () => {
        // make the video title link to the video on youtube at the current time (player.getCurrentTime())
        if (instantview.player && instantview.player.getCurrentTime && videoTitle.getAttribute("href")) {
            instantview.player.pauseVideo();
            let newLink;
            try {
                const currentLink = new URL(videoTitle.getAttribute("href"));
                currentLink.searchParams.delete("t");
                newLink = currentLink;
            }
            catch(e) {
                // the current href is invalid
                return;
            }
            const time = Math.round(instantview.player.getCurrentTime());
            newLink.searchParams.append("t", `${time}s`);
            if (time > 0) {
                videoTitle.setAttribute("href", newLink.href);
            }
        }
    });

    const infoAdditional = document.createElement("div");
    infoAdditional.setAttribute("id", "iv-video-info-additional");

    const videoViews = document.createElement("span");
    videoViews.classList.add("iv-video-views");

    const videoDate = document.createElement("span");
    videoDate.classList.add("iv-video-date");

    infoAdditional.append(videoDate, videoViews);

    titleWrapper.append(videoTitle);

    base.append(titleWrapper, infoAdditional);

    const w = watch(store.getState, "videoData");
    store.subscribe(w((newVal, oldVal, objectPath) => {
        videoInfoDataSync(store, videoTitle, videoViews, videoDate);
    }));

    // setup store connection and data
    videoInfoDataSync(store, videoTitle, videoViews, videoDate);

    return base;
};

function videoInfoDataSync(store, videoTitle, videoViews, videoDate) {

    const data = store.getState().videoData;
    const title = data.videoTitle || "N/A";
    videoTitle.textContent = title;
    videoTitle.setAttribute("title", title);
    if (data.videoId) {
        videoTitle.setAttribute("href", `https://www.youtube.com/watch?v=${data.videoId}`);
    }
    else {
        videoTitle.removeAttribute("href");
    }

    const views = data.videoViews ?
        `${data.videoViews.toLocaleString()} views`
        : "N/A";
    videoViews.textContent = views;
    videoViews.setAttribute("title", views);
    
    const date = data.videoDate ?
        new Date(data.videoDate)
        : "N/A";

    videoDate.textContent = date.toLocaleString(getLanguage(), {
        day: "numeric", month: "short", year: "numeric"
    });
    videoDate.setAttribute("title", date.toLocaleString());

}

function getLanguage() {
    return chrome.i18n.getUILanguage();
}

export default VideoPanel;
