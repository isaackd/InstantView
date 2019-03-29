const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

const API_KEY = "AIzaSyBBdCo-KyDeWBHkR2JrGdeL7tyrMq3z1-4";

export function getVideoData(videoId) {
    instantview.log(`getting video data: videoId=${videoId}`);
    return new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/videos`;

        try {
            const response = await ytget(endpoint, {
                id: videoId,
                part: "snippet,statistics",
                fields: "items(id,snippet(title,channelId,description,publishedAt),statistics(viewCount,likeCount,dislikeCount))"
            });
            if (response[0] && response[0].snippet) {
                resolve(response[0]);
            }
            else if (!response.length) {
                reject(new Error(`There were no videos matching the id: ${videoId}`));
            }
        }
        catch(e) {
            reject(e);
        }
    });
}
export function getChannelData(channelId) {
    instantview.log(`getting channel data: channelId=${channelId}`);
    return new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/channels`;

        try {
            const response = await ytget(endpoint, {
                id: channelId,
                part: "snippet,statistics",
                fields: "items(id,snippet(title,thumbnails/default),statistics/subscriberCount)"
            });
            resolve(response[0]);
        }
        catch(e) {
            reject(e);
        }
    });
}
export function getCommentData(videoId) {
    instantview.log(`getting comment data: videoId=${videoId}`);
    return new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/commentThreads`;

        try {
            const field = "snippet/topLevelComment/snippet";
            const response = await ytget(endpoint, {
                videoId,
                part: "snippet",
                fields: `items(${field}/authorChannelUrl,${field}/authorDisplayName,${field}/textDisplay)`,
                maxResults: 15,
                order: "relevance"
            });
            const comments = response.map(comment => {
                const data = comment.snippet.topLevelComment.snippet;
                return {
                    author: data.authorDisplayName,
                    authorUrl: data.authorChannelUrl,
                    text: data.textDisplay
                };
            });

            resolve(comments);
        }
        catch(e) {
            reject(e);
        }
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
function ytget(endpoint, options, key = API_KEY) {
    return new Promise((resolve, reject) => {

        const url = new URL(endpoint);

        for (const opt in options) {
            url.searchParams.append(opt, options[opt]);
        }

        url.searchParams.append("key", key);

        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            if (data.items) {
                resolve(data.items);
            }
            else if (data.error) {
                reject("Error while retrieving data from youtube: " + data.error.message + ` (code ${data.error.code})`);
            }
            else {
                instantview.log("Error while retrieving data from youtube (ytget_e)");
                reject("Error while retrieving data from youtube");
            }
        }).catch(e => {
            instantview.log(`Error while retrieving data from youtube (ytget_c): e=${e.message}`);
        });

    });
}