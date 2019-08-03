const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

export function getVideoData(videoId) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({message: "get_video_data", videoId}, response => {
            if (response.error) {
                reject(response.error);
            }
            else {
                resolve(response);
            }
        });
    });
}
export function getChannelData(channelId) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({message: "get_channel_data", channelId}, response => {
            if (response.error) {
                reject(response.error);
            }
            else {
                resolve(response);
            }
        });
    });
}
export function getCommentData(videoId) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({message: "get_comment_data", videoId}, response => {
            if (response.error) {
                reject(response.error);
            }
            else {
                resolve(response);
            }
        });
    });
}

export function getVideoRating(videoId) {
    instantview.log(`getting rating data: videoId=${videoId}`);
    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                resolve({rating: instantview.store.getState().videoData.videoRating});
            }, 276);
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "get_rating_request", videoId}, response => {
                if (response.OAuthDenied) {
                    reject("OAuthDenied");
                }
                else if (!response.error) resolve(response);
                else reject(response.error);
            });
        }
    });
}
export function rateVideo(videoId, rating) {
    instantview.log(`rating video: videoId=${videoId} rating=${rating}`);
    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                resolve({success: true, rating});
            }, 1530);
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "rate_request", videoId, rating}, response => {
                if (response.OAuthDenied) {
                    document.dispatchEvent(new Event("iv_oauth_denied"));
                    reject("OAuthDenied");
                }
                else if (response.success) {
                    resolve({success: response.success, rating});
                }
                else reject(`Unable to rate video: ${videoId} as: ${rating}`);
            }); 
        }
    });
}

export function getSubscriptionStatus(channelId) {
    instantview.log(`getting subscription status: channelId=${channelId}`);

    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                resolve({subscribed: instantview.store.getState().videoData.channelSubscribed, id: "test"});
            }, 276);
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "get_subscription_request", channelId}, response => {
                if (response.OAuthDenied) {
                    reject("OAuthDenied");
                }
                else if (!response.error) resolve(response);
                else reject(response.error);
            });
        }
    });
}
export function subscribeToChannel(channelId) {
    instantview.log(`subscribing to channel: channelId=${channelId}`);
    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                resolve({success: true});
            }, 1637);
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "subscribe_request", channelId}, response => {
                if (response.OAuthDenied) {
                    document.dispatchEvent(new Event("iv_oauth_denied"));
                    reject("OAuthDenied");
                }
                else if (response.success) {
                    resolve({success: response.success});
                }
                else reject(`Unable to subscribe to channel: ${channelId}`);
            }); 
        }
    });
}
export function unsubscribeFromChannel(subscriptionId) {
    instantview.log(`removing subscription: subscriptionId=${subscriptionId}`);
    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                resolve({success: true});
            }, 642);
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "unsubscribe_request", subscriptionId}, response => {
                if (response.OAuthDenied) {
                    document.dispatchEvent(new Event("iv_oauth_denied"));
                    reject("OAuthDenied");
                }
                else if (response.success) {
                    resolve({success: response.success});
                }
                else reject(`Unable to unsubscribe from channel: ${subscriptionId}`);
            }); 
        }
    });
}

export function getAuth(interactive = true) {
    instantview.log("YTAPI GETTING AUTHORIZATION");
    return new Promise((resolve, reject) => {
        if (mode === dev) {
            setTimeout(() => {
                const OAuthDenied = false;
                if (OAuthDenied) {
                    reject();
                }
                else {
                    resolve();
                }
            }, 76)
        }
        else if (mode === prod) {
            chrome.runtime.sendMessage({message: "get_auth", interactive}, response => {
                if (!response.OAuthDenied) {
                    if (interactive) {
                        const videoData = instantview.store.getState().videoData;

                        instantview.store.dispatch(instantview.videoDataActions.getVideoRating(videoData.videoId));
                        instantview.store.dispatch(instantview.videoDataActions.getSubscribeStatus(videoData.channelId));
                    }
                    resolve();
                }
                else {
                    reject();
                }
            });
        }
    });
}