import "./index.scss";

import svgload from "../../libs/svgload.js";

import * as stateActions from "../../actions/stateActions.js";
import * as videoDataActions from "../../actions/videoDataActions.js";

import { handleRateButtonClick } from "../../actions/ratingsActions.js";

import Channel from "./Channel.js";
import ActionButton from "./ActionButton.js";

import LikeIcon         from "../../../icons/like.svg";
import DislikeIcon      from "../../../icons/dislike.svg";

import MinimizeIcon     from "../../../icons/minimize.svg";
import CommentsIcon     from "../../../icons/comments.svg";
import VisualizerIcon   from "../../../icons/visualizer.svg";

import SpinnerIcon      from "../../../icons/spinner.svg";

const VideoActions = (store) => {
    const base = document.createElement("div");
    base.setAttribute("id", "iv-video-actions");

    store.subscribe(() => {
        videoActionsDataSync(store, base);
    });
    videoActionsDataSync(store, base);

    const channel = Channel(store);

    const actions = document.createElement("div");
    actions.setAttribute("id", "iv-actions");

    /// #if BROWSER === "chrome"

    const ratingsButtons = document.createElement("div");
    ratingsButtons.classList.add("iv-ratings-buttons");

    const likeButton = ActionButton(LikeIcon, "like");
    likeButton.setAttribute("id", "iv-like-button");
    const dislikeButton = ActionButton(DislikeIcon, "dislike");
    dislikeButton.setAttribute("id", "iv-dislike-button");

    const likeSpinner = svgload(SpinnerIcon);
    const dislikeSpinner = svgload(SpinnerIcon);

    likeSpinner.classList.add("iv-ratings-spinner");
    dislikeSpinner.classList.add("iv-ratings-spinner");

    likeSpinner.setAttribute("id", "iv-like-spinner");
    dislikeSpinner.setAttribute("id", "iv-dislike-spinner");

    likeButton.addEventListener("click", () => {
        const state = instantview.store.getState();
        const alreadyHandling = state.ratings.handlingRateButtonClick;
        
        if (!alreadyHandling) {
            instantview.store.dispatch(handleRateButtonClick("like")).catch(e => {
                // throw e;
            });
        }
    });

    dislikeButton.addEventListener("click", async () => {
        const state = instantview.store.getState();
        const alreadyHandling = state.ratings.handlingRateButtonClick;
        
        if (!alreadyHandling) {
            instantview.store.dispatch(handleRateButtonClick("dislike")).catch(e => {
                // throw e;
            });
        }
    });

    likeButton.prepend(likeSpinner);
    dislikeButton.prepend(dislikeSpinner);

    ratingsButtons.append(likeButton, dislikeButton);

    /// #endif

    const commonButtons = document.createElement("div");
    commonButtons.classList.add("iv-common-buttons");

    const minimizeButton = ActionButton(MinimizeIcon, "minimize");
    const commentsButton = ActionButton(CommentsIcon, "comments");
    const visualizerButton = ActionButton(VisualizerIcon, "visualizer");

    minimizeButton.setAttribute("id", "iv-minimize-button");
    minimizeButton.addEventListener("click", () => {
    	store.dispatch(stateActions.minimizeModal());
    });

    commentsButton.classList.add("iv-comments-button");
    commentsButton.addEventListener("click", () => {
        const data = store.getState();
        if (!data.state.commentsOpen) {
            store.dispatch(stateActions.openComments());
            if (data.videoData.commentsId !== data.videoData.videoId) {
                store.dispatch(videoDataActions.getCommentData(data.videoData.videoId)).catch(e => {
                    
                });
            }
        }
        else {
            store.dispatch(stateActions.closeComments());
        }
    });
    visualizerButton.addEventListener("click", () => {
        const data = store.getState();
        const state = data.state;

        if (!state.visualizerOpen) {
            store.dispatch(stateActions.openVisualizer());
        }
        else {
            store.dispatch(stateActions.closeVisualizer());
        }
    });

    commonButtons.append(minimizeButton, commentsButton, visualizerButton);

    /// #if BROWSER === "chrome"

    actions.append(ratingsButtons, commonButtons);

    /// #else

    actions.append(commonButtons);

    /// #endif


    base.append(channel, actions);
    return base;
};

function videoActionsDataSync(store, base) {
    const videoData = store.getState().videoData;

    const likeButton = document.getElementById("iv-like-button");
    const dislikeButton = document.getElementById("iv-dislike-button");

    if (likeButton && dislikeButton) {

        const buttonTitle = (videoData.videoLikes !== null && videoData.videoDislikes !== null)  ?
        `${videoData.videoLikes} likes, ${videoData.videoDislikes} dislikes` :
        "";

        likeButton.setAttribute("title", buttonTitle);
        dislikeButton.setAttribute("title", buttonTitle);

        if (!videoData.videoRatingPending) {
            const icons = [
                likeButton.querySelector("svg:nth-child(2)"),
                dislikeButton.querySelector("svg:nth-child(2)")
            ];

            const spinners = [
                document.querySelector("#iv-like-button > svg:nth-child(1)"),
                document.querySelector("#iv-dislike-button > svg:nth-child(1)")
            ];

            for (const icon of icons) {
                if (icon && icon.style) {
                    icon.style.removeProperty("display");
                }
            }
            for (const spinner of spinners) {
                if (spinner && spinner.classList) {
                    spinner.classList.remove("active");
                }
            }
        }

    }
}

export default VideoActions;
