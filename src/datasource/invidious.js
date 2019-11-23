// https://github.com/omarroth/invidious/wiki/API
const INVIDIOUS_DATA_SOURCE = {name: "Invidious"};
const INVIDIOUS_INSTANCE = "https://invidio.us";

// For format information see
// videoDataReducer.js::handleVideoData(...)
INVIDIOUS_DATA_SOURCE.handleGetVideoData = function(request, sender, sendResponse) {
    ivlog(`getting video data: videoId=${request.videoId}`);
    const res = new Promise(async (resolve, reject) => {
        const endpoint = `${INVIDIOUS_INSTANCE}/api/v1/videos/${request.videoId}`;

        try {
            const response = await ivget(endpoint, {
                fields: "videoId,title,authorId,description,published,viewCount,likeCount,dislikeCount"
            });

            const data = response;

            resolve({
                id: data.videoId,
                channelId: data.authorId,

                title: data.title,
                description: data.description,
                publishedAt: new Date(data.published * 1000).toISOString(),

                views: data.viewCount,
                likes: data.likeCount,
                dislikes: data.dislikeCount
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
// videoDataReducer.js::handleChannelData(...)
INVIDIOUS_DATA_SOURCE.handleGetChannelData = function(request, sender, sendResponse) {
    ivlog(`getting channel data: channelId=${request.channelId}`);
    const res = new Promise(async (resolve, reject) => {

        const endpoint = `${INVIDIOUS_INSTANCE}/api/v1/channels/${request.channelId}`;

        try {
            const response = await ivget(endpoint, {
                fields: "authorId,author,authorThumbnails/url,subCount"
            });

            const data = response;

            resolve({
                id: data.authorId,
                title: data.author,
                thumbnail: data.authorThumbnails[0].url,
                subscribers: data.subCount
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
INVIDIOUS_DATA_SOURCE.handleGetCommentData = function(request, sender, sendResponse) {
    ivlog(`getting comment data: videoId=${request.videoId} pageToken: ${request.pageToken}`);
    const res = new Promise(async (resolve, reject) => {

        const endpoint = `${INVIDIOUS_INSTANCE}/api/v1/comments/${request.videoId}`;

        try {
            const fields = `continuation,comments(commentId,authorUrl,author,content)`;

            const requestData = {
                fields,
                sort_by: "top",
                source: "youtube"
            };

            if (request.pageToken) {
                requestData.continuation = request.pageToken;
            }

            const response = await ivget(endpoint, requestData);
            const comments = response.comments.map(comment => {
                return {
                    id: comment.commentId,
                    videoId: request.videoId,
                    author: comment.author,
                    authorUrl: comment.authorUrl,
                    text: comment.content
                };
            });

            resolve({comments, nextPageToken: response.continuation});
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

function ivget(endpoint, options) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);

        for (const opt in options) {
            url.searchParams.append(opt, options[opt]);
        }

        url.searchParams.append("ref", "InstantView");

        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            resolve(data);
        }).catch(e => {
            ivlog(`Error while retrieving data from invidious (ivget_c): e=${e.message}`);
            reject(`Error while retrieving data from invidious (ivget_c): e=${e.message}`);
        });

    });
}
