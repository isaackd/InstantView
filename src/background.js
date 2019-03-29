const RATE_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos/rate";
const GET_RATING_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos/getRating";

const SUBSCRIBE_ENDPOINT = "https://www.googleapis.com/youtube/v3/subscriptions";
const GET_SUBSCRIPTION_ENDPOINT = "https://www.googleapis.com/youtube/v3/subscriptions";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "log_request") {
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
            const responseData = {OAuthDenied: false}
            bglog(`get_auth_response: OAuthDenied=${responseData.OAuthDenied}`);
            sendResponse(responseData);
        }
        else if (chrome.runtime.lastError || !token) {
            const responseData = {OAuthDenied: true}
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
    chrome.permissions.request({ permissions: ["identity"] }, granted => {
        bglog(`request_permissions_response: granted=${granted}`);
        sendResponse(granted)
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

function sendMessageToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length) chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

chrome.commands.onCommand.addListener(command => {
    sendMessageToActiveTab(command)
});