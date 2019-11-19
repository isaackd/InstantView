import "./Channel.scss";

import { handleSubscribeClick } from "../../actions/ratingsActions.js";

import DefaultAvatar from "../../../images/default_avatar.png";
import SubscribeButton from "./SubscribeButton.js";

const defaultAvatar = (window.chrome && chrome.runtime && chrome.runtime.getURL) ?
    chrome.runtime.getURL("src/" + DefaultAvatar) :
    DefaultAvatar;

const Channel = (store) => {
    const base = document.createElement("div");
    base.classList.add("iv-channel");

    const avatarWrapper = document.createElement("a");
    avatarWrapper.classList.add("iv-channel-avatar-wrapper");
    avatarWrapper.setAttribute("target", "_blank");
    avatarWrapper.setAttribute("rel", "noopener");

    const avatar = document.createElement("img");
    avatar.classList.add("iv-channel-avatar");

    avatar.setAttribute("src", defaultAvatar);

    const channelContent = document.createElement("div");
    channelContent.classList.add("iv-channel-content");

    const channelTitle = document.createElement("a");
    channelTitle.classList.add("iv-channel-title");
    channelTitle.setAttribute("target", "_blank");
    channelTitle.setAttribute("rel", "noopener");

    const subscribeButton = SubscribeButton(store);
    subscribeButton.addEventListener("click", e => {
        const state = instantview.store.getState();
        const alreadyHandling = state.ratings.handlingSubscribeClick;
        
        if (!alreadyHandling) {
            instantview.store.dispatch(handleSubscribeClick()).catch(e => {
                // throw e;
            });
        }
    });

    avatarWrapper.append(avatar);
    channelContent.append(channelTitle, subscribeButton);

    base.append(avatarWrapper, channelContent);

    store.subscribe(() => {
        channelDataSync(store, avatarWrapper, avatar, channelTitle);
    });

    // setup store connection and data
    channelDataSync(store, avatarWrapper, avatar, channelTitle);

    return base;
};

function channelDataSync(store, avatarWrapper, avatar, channelTitle) {
    const data = store.getState().videoData;

    const title = data.channelTitle || "N/A";

    if (data.channelLink) {
        avatarWrapper.setAttribute("href", data.channelLink);
        channelTitle.setAttribute("href", data.channelLink);
    }
    else {
        avatarWrapper.removeAttribute("href");
        channelTitle.removeAttribute("href");
    }

    avatar.setAttribute("src", data.channelAvatar || defaultAvatar);
    avatar.setAttribute("title", title);

    channelTitle.textContent = title;
    channelTitle.setAttribute("title", title);
}

export default Channel;
