const RATE_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos/rate";
const GET_RATING_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos/getRating";

const SUBSCRIBE_ENDPOINT = "https://www.googleapis.com/youtube/v3/subscriptions";
const GET_SUBSCRIPTION_ENDPOINT = "https://www.googleapis.com/youtube/v3/subscriptions";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "get_video_data") {
        handleGetVideoData(request, sender, sendResponse);
    }
    else if (request.message === "get_channel_data") {
        handleGetChannelData(request, sender, sendResponse);
    }
    else if (request.message === "get_comment_data") {
        handleGetCommentData(request, sender, sendResponse);
    }
    else if (request.message === "log_request") {
        handleLogRequest(request, sender, sendResponse);
    }
    else if (request.message === "rate_request") {
    	handleRateRequest(request, sender, sendResponse);
    }
    else if (request.message === "get_rating_request") {
    	handleGetRatingRequest(request, sender, sendResponse);
    }
    else if (request.message === "subscribe_request") {
        handleSubscribeRequest(request, sender, sendResponse);
    }
    else if (request.message === "unsubscribe_request") {
        handleUnsubscribeRequest(request, sender, sendResponse);
    }
    else if (request.message === "get_subscription_request") {
        handleGetSubscriptionRequest(request, sender, sendResponse);
    }
    else if (request.message === "get_auth") {
        handleGetAuthRequest(request, sender, sendResponse);
    }
    else if (request.message === "get_permissions") {
        handleGetPermissionsRequest(request, sender, sendResponse);
    }
    else if (request.message === "request_permissions") {
        handleRequestPermissions(request, sender, sendResponse);
    }
    return true;
});

const LOG_LIMIT = 100;
let logs = 0;

function ivlog(...params) {
    const text = params.join(" ");
    console.log(`[ %c${new Date().toLocaleTimeString()} - IVLOG %c] ${text}`, "color: blue", "");
    logs++;
}
function bglog(...params) {
    const text = params.join(" ");
    console.log(`[ %c${new Date().toLocaleTimeString()} - BGLOG %c] ${text}`, "color: green", "");
    logs++;
}

function handleLogRequest(request, sender, sendResponse) {
    if (logs > LOG_LIMIT) {
        console.clear();
        console.log("__REACHED_LOG_LIMIT__");
        logs = 0;
    }
    ivlog(request.log);
}

function handleRateRequest(request, sender, sendResponse) {
    bglog(`rate_request: videoId=${request.videoId} rating=${request.rating}`);

    chrome.identity.getAuthToken({ "interactive": true }, token => {
        if (token) {
            const url = `${RATE_ENDPOINT}?id=${request.videoId}&rating=${request.rating}&access_token=${token}`;
            fetch(url, {
                method: "POST"
            }).then(response => {
                const responseData = {success: response.status === 204};
                bglog(`rate_request_response:`, responseData);
                sendResponse(responseData);
            });
        }
        else {
            const responseData = {OAuthDenied: true};
            bglog(`rate_request_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
    });
}
function handleGetRatingRequest(request, sender, sendResponse) {
    bglog(`get_rating_request: videoId=${request.videoId}`);
    chrome.identity.getAuthToken({ "interactive": false }, token => {
        if (token) {
            const url = `${GET_RATING_ENDPOINT}?id=${request.videoId}&access_token=${token}`;
            fetch(url).then(response => {
                return response.json();
            }).then(data => {
                if (data.items && data.items[0] && data.items[0].rating) {
                    const responseData = {videoId: request.videoId, rating: data.items[0].rating};
                    bglog(`get_rating_response: videoId=${responseData.videoId} rating=${responseData.rating}`);
                    sendResponse(responseData);
                }
                else if (data.error && data.error.message === "Invalid Credentials") {
                    bglog(`removing cached OAuth token since it no longer works: error=${data.error.message}`);
                    chrome.identity.removeCachedAuthToken({token}); 
                    sendResponse({OAuthDenied: true});
                }
            }).catch(e => {
                const responseData = {videoId: request.videoId, error: e.message};
                bglog(`get_rating_response: videoId=${responseData.videoId} error=${responseData.error}`);
                sendResponse(responseData);
            });
        }
        else if (chrome.runtime.lastError || !token) {
            bglog(`Couldn\'t get OAuth token: token=${token}`);
            sendResponse({OAuthDenied: true});
        }
    });
}
function handleGetAuthRequest(request, sender, sendResponse) {
    const interactive = request.hasOwnProperty("interactive") ? request.interactive : true;
    bglog(`get_auth_request: interactive=${interactive}`);
    chrome.identity.getAuthToken({ interactive }, token => {
        if (token) {
            const responseData = {OAuthDenied: false};
            bglog(`get_auth_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
        else if (chrome.runtime.lastError || !token) {
            const responseData = {OAuthDenied: true};
            bglog(`get_auth_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
    });
}
function handleGetPermissionsRequest(request, sender, sendResponse) {
    bglog("get_permissions_request");
    chrome.permissions.contains({ permissions: ["identity"] }, result => {
        bglog(`get_permissions_response: result=${result}`);
        sendResponse(result);
    });
}
function handleRequestPermissions(request, sender, sendResponse) {
    bglog("request_permissions");
    chrome.permissions.request({ permissions: ["identity"], origins: ["https://www.youtube.com/*"] }, granted => {
        bglog(`request_permissions_response: granted=${granted}`);
        sendResponse(granted);
    });
}

function handleSubscribeRequest(request, sender, sendResponse) {
    bglog(`subscribe_request: channelId=${request.channelId}`);

    chrome.identity.getAuthToken({ "interactive": true }, token => {
        if (token) {
            const url = `${SUBSCRIBE_ENDPOINT}?part=snippet&access_token=${token}`;
            fetch(url, {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    snippet: {
                        resourceId: {
                            kind: "youtube#channel",
                            channelId: request.channelId
                        }
                    }
                })
            }).then(response => {
                const responseData = {success: response.status === 200};
                bglog(`subscribe_response: success=${responseData.success}`);
                sendResponse(responseData);
            });
        }
        else {
            const responseData = {OAuthDenied: true};
            bglog(`subscribe_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
    });
}
function handleUnsubscribeRequest(request, sender, sendResponse) {
    bglog(`unsubscribe_request: subscriptionId=${request.subscriptionId}`);

    chrome.identity.getAuthToken({ "interactive": true }, token => {
        if (token) {
            const url = `${SUBSCRIBE_ENDPOINT}?id=${request.subscriptionId}&access_token=${token}`;
            fetch(url, {
                method: "DELETE"
            }).then(response => {
                const responseData = {success: response.status === 204};
                bglog(`unsubscribe_response: success=${responseData.success}`);
                sendResponse(responseData);
            });
        }
        else {
            const responseData = {OAuthDenied: true};
            bglog(`unsubscribe_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
    });
}
function handleGetSubscriptionRequest(request, sender, sendResponse) {
    bglog(`get_subscription_request: channelId=${request.channelId}`);
    chrome.identity.getAuthToken({ "interactive": false }, token => {
        if (token) {
            const url = `${GET_SUBSCRIPTION_ENDPOINT}?part=id&mine=true&forChannelId=${request.channelId}&access_token=${token}`;
            fetch(url).then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
                if (data && data.items) {
                    const responseData = {
                        channelId: request.channelId, 
                        subscribed: data.items.length === 1, 
                        id: data.items.length === 1 ? data.items[0].id : null
                    };
                    bglog(`get_subscription_response: channelId=${responseData.channelId} subscribed=${responseData.subscribed} id=${responseData.id}`);
                    sendResponse(responseData);
                }
                else if (data.error && data.error.message === "Invalid Credentials") {
                    bglog(`removing cached OAuth token since it no longer works: error=${data.error.message}`);
                    chrome.identity.removeCachedAuthToken({token}); 
                    sendResponse({OAuthDenied: true});
                }
            }).catch(e => {
                const responseData = {channelId: request.channelId, error: e.message};
                bglog(`get_subscription_response: channelId=${responseData.channelId} error=${responseData.error}`);
                sendResponse(responseData);
            });
        }
        else if (chrome.runtime.lastError || !token) {
            bglog(`Couldn\'t get OAuth token: token=${token}`);
            sendResponse({OAuthDenied: true});
        }
    });
}

// For format information see
// videoDataReducer.js::handleVideoData(...)
function handleGetVideoData(request, sender, sendResponse) {
    ivlog(`getting video data: videoId=${request.videoId}`);
    const res = new Promise(async (resolve, reject) => {
        const endpoint = `https://www.googleapis.com/youtube/v3/videos`;

        try {
            const response = await ytget(endpoint, {
                id: request.videoId,
                part: "snippet,statistics",
                fields: "items(id,snippet(title,channelId,description,publishedAt),statistics(viewCount,likeCount))"
            });

            console.log(response);

            if (response.items[0] && response.items[0].snippet) {
                const data = response.items[0];

                resolve({
                    id: data.id,
                    channelId: data.snippet.channelId,

                    title: data.snippet.title,
                    description: data.snippet.description,
                    publishedAt: data.snippet.publishedAt,

                    views: data.statistics.viewCount,
                    likes: data.statistics.likeCount
                });
            }
            else if (!response.items.length) {
                reject({error: new Error(`There were no videos matching the id: ${request.videoId}`)});
            }
        }
        catch(e) {
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err});
    });
};


// For format information see
// videoDataReducer.js::handleChannelData(...)
function handleGetChannelData(request, sender, sendResponse) {
    ivlog(`getting channel data: channelId=${request.channelId}`);
    const res = new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/channels`;

        try {
            const response = await ytget(endpoint, {
                id: request.channelId,
                part: "snippet,statistics",
                fields: "items(id,snippet(title,thumbnails/default),statistics/subscriberCount)"
            });

            const data = response.items[0];
            resolve({
                id: data.id,
                title: data.snippet.title,
                thumbnail: data.snippet.thumbnails.default.url,
                subscribers: data.statistics.subscriberCount
            });
        }
        catch(e) {
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err});
    });
};



// For format information see
// videoDataReducer.js::handleCommentData(...)
function handleGetCommentData(request, sender, sendResponse) {
    ivlog(`getting comment data: videoId=${request.videoId} pageToken: ${request.pageToken}`);
    const res = new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/commentThreads`;

        try {
            const field = "snippet/topLevelComment/snippet";
            const items = `items(snippet/topLevelComment/id,${field}/authorChannelUrl,${field}/authorDisplayName,${field}/textDisplay)`;

            const requestData = {
                videoId: request.videoId,
                part: "snippet",
                fields: `nextPageToken,${items}`,
                maxResults: 15,
                order: "relevance"
            };

            if (request.pageToken) {
                requestData.pageToken = request.pageToken;
            }

            const response = await ytget(endpoint, requestData);
            const comments = response.items.map(comment => {
                const data = comment.snippet.topLevelComment.snippet;
                return {
                    id: comment.snippet.topLevelComment.id,
                    videoId: request.videoId,
                    author: data.authorDisplayName,
                    authorUrl: data.authorChannelUrl,
                    text: data.textDisplay
                };
            });

            resolve({comments, nextPageToken: response.nextPageToken});
        }
        catch(e) {
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err});
    });
};


function ytget(endpoint, options) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);

        for (const opt in options) {
            url.searchParams.append(opt, options[opt]);
        }

        let g = ["YouTube"[6].toLowerCase(), "YouTube"[0].toLowerCase()];
        url.searchParams.append("k" + g.toString()
            .replace(",", ""), atob("QUl6Y" + "VN5Q180UDhQ" + "OVcyR0dNcX" + "hpQmVmRVludWlDUHl" + "aa" + "C1HR1Fj"));


        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            if (data.error) {
                if (data.error && data.error.errors && data.error.errors[0] && data.error.errors[0].reason && data.error.errors[0].reason === "commentsDisabled") {
                    reject("commentsDisabled");
                }
                else {
                    reject("Error while retrieving data from youtube: " + data.error.message + ` (code ${data.error.code})`);
                }
            }
            else if (data.items) {
                resolve(data);
            }
            else {
                ivlog("Error while retrieving data from youtube (ytget_e)");
                reject("Error while retrieving data from youtube");
            }
        }).catch(e => {
            ivlog(`Error while retrieving data from youtube (ytget_c): e=${e.message}`);
        });

    });
}

function sendMessageToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

chrome.commands.onCommand.addListener(command => {
    sendMessageToActiveTab(command);
});
