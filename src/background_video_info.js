const API_KEY = "AIzaSyBBdCo-KyDeWBHkR2JrGdeL7tyrMq3z1-4";

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
    return true;
});

function handleGetVideoData(request, sender, sendResponse) {
    ivlog(`getting video data: videoId=${request.videoId}`);
    const res = new Promise(async (resolve, reject) => {
        const endpoint = `https://www.googleapis.com/youtube/v3/videos`;

        try {
            const response = await ytget(endpoint, {
                id: request.videoId,
                part: "snippet,statistics",
                fields: "items(id,snippet(title,channelId,description,publishedAt),statistics(viewCount,likeCount,dislikeCount))"
            });
            if (response[0] && response[0].snippet) {
                resolve(response[0]);
            }
            else if (!response.length) {
                reject({error: new Error(`There were no videos matching the id: ${request.videoId}`)});
            }
        }
        catch(e) {
            console.log("there was an error", e);
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err})
    });
}
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
            resolve(response[0]);
        }
        catch(e) {
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err})
    });
}
function handleGetCommentData(request, sender, sendResponse) {
    ivlog(`getting comment data: videoId=${request.videoId}`);
    const res = new Promise(async (resolve, reject) => {

        const endpoint = `https://www.googleapis.com/youtube/v3/commentThreads`;

        try {
            const field = "snippet/topLevelComment/snippet";
            const response = await ytget(endpoint, {
                videoId: request.videoId,
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
            reject({error: e});
        }
    });
    res.then(data => {
        sendResponse(data);
    }).catch(err => {
        sendResponse({error: err})
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
                ivlog("Error while retrieving data from youtube (ytget_e)");
                reject("Error while retrieving data from youtube");
            }
        }).catch(e => {
            ivlog(`Error while retrieving data from youtube (ytget_c): e=${e.message}`);
        });

    });
}