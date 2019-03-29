const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import * as ytapi from "../libs/ytapi.js";

instantview.ytapi = ytapi;

import store from "../store.js";

export function loadVideo(videoId, playVideo = true, startSeconds = 0) {
    if (!videoId) throw new Error("A video id must be provided to load");
    
    const data = store.getState();
    const loadVideo = data.videoData.videoId !== videoId;
    const loadComments = data.state.commentsOpen && !data.state.commentsLoading
        && ((data.videoData.commentsId !== data.videoData.videoId)
        || (videoId !== data.videoData.videoId || videoId !== data.videoData.commentsId));

    if (videoId !== data.videoData.videoId && playVideo) instantview.player.loadVideoById(videoId, startSeconds);
    // get the video info
    if (loadVideo) {
        const videoDataAction = getVideoData(videoId);
        videoDataAction.payload.then(vidData => {
            // get the channel info
            const loadChannel = (data.videoData.channelId !== vidData.snippet.channelId);
            if (loadChannel) {
                store.dispatch(getChannelData(vidData.snippet.channelId));

                instantview.stateActions.getIdentityGranted().then(() => {
                    // We have the identity permission
                    store.dispatch(getSubscribeStatus(vidData.snippet.channelId)).catch(e => {});
                }).catch(e => {
                    // We have the identity permission, ask for it
                    instantview.stateActions.requestIdentityPermission().then(() => {
                        // user allowed identity permission
                        store.dispatch(getSubscribeStatus(vidData.snippet.channelId)).catch(e => {});
                    }).catch(e => {
                        // user denied identity permission
                    });
                });
            }
        });
        store.dispatch(videoDataAction);

        instantview.stateActions.getIdentityGranted().then(() => {
            // We have the identity permission
            store.dispatch(getVideoRating(videoId)).catch(e => {});
        }).catch(() => {
            // We have the identity permission, ask for it
            instantview.stateActions.requestIdentityPermission().then(() => {
                // user allowed identity permission
                store.dispatch(getVideoRating(videoId)).catch(e => {});
            }).catch(() => {
                // user denied identity permission
            });
        });
    }
    if (loadComments) {
        store.dispatch(getCommentData(videoId));
    }   
}

export function loadPlaylist(videoId, playlistId, index = 0) {
    instantview.player.loadPlaylist({
        list: playlistId,
        listType: "playlist",
        index
    });
    loadVideo(videoId, false);
}

export function getVideoData(videoId) {
    if (!videoId) throw new Error("A video id must be provided to retrieve information");
    return {
        type: "GET_VIDEO_DATA",
        payload: ytapi.getVideoData(videoId)
    }
}
export function getChannelData(channelId) {
    if (!channelId) throw new Error("A channel id must be provided to retrieve information");
    return {
        type: "GET_CHANNEL_DATA",
        payload: ytapi.getChannelData(channelId)
    }
}
export function getCommentData(videoId) {
    if (!videoId) throw new Error("A video id must be provided to retrieve information");
    return {
        type: "GET_COMMENT_DATA",
        payload: ytapi.getCommentData(videoId)
    }
}

export function getVideoRating(videoId) {
    if (!videoId) throw new Error("A video id must be provided to get a rating");
    return {
        type: "GET_VIDEO_RATING",
        payload: ytapi.getVideoRating(videoId)
    }
}
export function rateVideo(videoId, rating) {
    if (!videoId) throw new Error("A video id must be provided to rate");

    updateLastWriteRequest();

    return {
        type: "RATE_VIDEO",
        payload: ytapi.rateVideo(videoId, rating)
    }
}

export function getSubscribeStatus(channelId) {
    // if (!channelId) throw new Error("A channel id must be provided to get the subscribe status");
    return {
        type: "GET_SUBSCRIBE_STATUS",
        payload: ytapi.getSubscriptionStatus(channelId)
    }
}

export function subscribeToChannel(channelId) {
    if (!channelId) throw new Error("A channel id must be provided to subscribe to a channel");

    updateLastWriteRequest();

    return {
        type: "SUBSCRIBE_TO_CHANNEL",
        payload: ytapi.subscribeToChannel(channelId)
    }
}
export function unsubscribeFromChannel(subscriptionId) {
    if (!subscriptionId) throw new Error("A subscription id must be provided to remove a subscription");

    updateLastWriteRequest();

    return {
        type: "UNSUBSCRIBE_FROM_CHANNEL",
        payload: ytapi.unsubscribeFromChannel(subscriptionId)
    }
}

export function getAuth(interactive = true) {
    return {
        type: "GET_AUTH",
        payload: ytapi.getAuth(interactive)
    }
}

export function getLastWriteRequest() {
    return new Promise((resolve, reject) => {

        if (mode === prod) {
            chrome.storage.local.get("iv_last_write_request", items => {
                if (items && items.iv_last_write_request) {
                    resolve(items.iv_last_write_request);
                }
                else {
                    reject("Unable to retrieve last write request");
                }
            });
        }
        else {
            const lrr = localStorage.getItem("iv_last_write_request");
            if (lrr) {
                resolve(parseInt(lrr, 10));
            }
            else {
                reject("Unable to retrieve last write request");
            }
        }

    });
}

function updateLastWriteRequest() {
    if (mode === prod) {
        chrome.storage.local.set({iv_last_write_request: Date.now()}, function() {
            // after the data is saved
        });
    }
    else {
        localStorage.setItem("iv_last_write_request", Date.now());
    }
}