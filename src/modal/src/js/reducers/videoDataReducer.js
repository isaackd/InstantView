const defaultState = {
    videoId: null,

    videoTitle: null,
    videoViews: null,
    videoLikes: null,
    videoDislikes: null,

    videoDate: null,

    videoRating: null,
    videoRatingPending: false,

    commentsId: null,
    commentsNextToken: null,
    commentsLoading: false,

    videoComments: [],
    videoDescription: null,

    channelId: null,
    channelTitle: null,
    channelAvatar: null,
    channelLink: null,
    
    channelSubscribed: false,
    channelSubscribers: null,
    channelSubscriptionPending: false
};

export default function reducer(state, action) {
    const results = [
        handleVideoData(state, action), 
        handleChannelData(state, action), 
        handleCommentData(state, action),
        handleVideoRating(state, action),
        handleGetVideoRating(state, action),
        handleChannelSubscribe(state, action),
        handleChannelUnsubscribe(state, action),
        handleGetSubscribeStatus(state, action),
        handleGetAuth(state, action)];  
    for (const res of results) {
        if (res) {
            return res;
        }
    }

    return state ? state : defaultState;
}

// Expects an object payload with the following properties:

// id: the ID of the video
// channelId: the ID of the channel that uploaded the video
// title: the title of the video
// description: the description of the video
// publishedAt: when the video was published in ISO 8601 format

// views: amount of views the video has
// likes: amount of likes the video has
// dislikes: amount of dislikes the video has
function handleVideoData(state, action) {
    if (action.type === "GET_VIDEO_DATA_PENDING") {
        return Object.assign({}, state, {
            videoId: null,
            videoTitle: null,
            videoViews: null,
            videoLikes: null,
            videoDislikes: null,
            videoDescription: null,
            videoDate: null
        });
    }
    else if (action.type === "GET_VIDEO_DATA_FULFILLED") {
        const { payload } = action;

        return Object.assign({}, state, {
            videoId: payload.id,
            videoTitle: payload.title,
            videoViews: parseInt(payload.views, 10),
            videoLikes: parseInt(payload.likes, 10),
            videoDislikes: parseInt(payload.dislikes, 10),
            videoDescription: payload.description,
            videoDate: payload.publishedAt
        });
    }
    else if (action.type === "GET_VIDEO_DATA_REJECTED") {
        instantview.log("GET_VIDEO_DATA_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["retriveDataFail_Video"]);
        return defaultState;
    }
}


// Expects an object payload with the following properties:

// id: the ID of the channel
// title: the title of the channel
// thumbnail: url to the default thumbnail of the channel
// subscribers: the amount of subscribers the channel has
function handleChannelData(state, action) {
    if (action.type === "GET_CHANNEL_DATA_PENDING") {

    }
    else if (action.type === "GET_CHANNEL_DATA_FULFILLED") {
        const { payload } = action;

        let subCount = parseInt(payload.subscribers, 10);
        if (!isNaN(subCount)) {
            subCount = abbreviateNumber(subCount);
        }
        else {
            subCount = null;
        }

        return Object.assign({}, state, {
            channelId: payload.id,
            channelTitle: payload.title,
            channelLink: `http://www.youtube.com/channel/${payload.id}`,
            channelAvatar: payload.thumbnail,
            channelSubscribers: subCount
        });
    }
    else if (action.type === "GET_CHANNEL_DATA_REJECTED") {
        instantview.log("GET_CHANNEL_DATA_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["retriveDataFail_Channel"]);
        return defaultState;
    }
}


// Expects an object payload with the following properties:

// comments: array of objects with these properties
//      id: the ID of the comment
//      videoId: the ID of the video that the comment is on
//      author: the title of the channel who authored the comment
//      authorUrl: a link to the channel
//      text: the content of the comment

// nextPageToken: the continuation key for the next page of comments
// only required if intending to load more comments
function handleCommentData(state, action) {
    if (action.type === "GET_COMMENT_DATA_PENDING") {
        hideLoadMore();

        return Object.assign({}, state, {
            commentsLoading: true
        });
    }
    else if (action.type === "GET_COMMENT_DATA_FULFILLED") {
        if (action.payload.nextPageToken) {
            showLoadMore();
        }

        return Object.assign({}, state, {
            videoComments: action.payload.comments,
            commentsId: state.videoId,
            commentsNextToken: action.payload.nextPageToken,
            commentsLoading: false
        });
    }
    else if (action.type === "GET_COMMENT_DATA_REJECTED") {
        instantview.log("GET_COMMENT_DATA_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["retriveDataFail_Comment"]);
        return Object.assign({}, state, {
            commentsLoading: false
        });
    }

    else if (action.type === "GET_MORE_COMMENT_DATA_PENDING") {
        hideLoadMore();

        return Object.assign({}, state, {
            commentsLoading: true
        });
    }
    else if (action.type === "GET_MORE_COMMENT_DATA_FULFILLED") {
        if (action.payload.nextPageToken) {
            showLoadMore();
        }

        return Object.assign({}, state, {
            videoComments: state.videoComments.concat(action.payload.comments),
            commentsId: state.videoId,
            commentsNextToken: action.payload.nextPageToken,
            commentsLoading: false
        });
    }
    else if (action.type === "GET_MORE_COMMENT_DATA_REJECTED") {
        instantview.log("GET_MORE_COMMENT_DATA_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["retriveDataFail_Comment"]);
        return Object.assign({}, state, {
            commentsLoading: false
        });
    }
}

function handleGetVideoRating(state, action) {
    if (action.type === "GET_VIDEO_RATING_PENDING") {
        return Object.assign({}, state, {
            videoRating: null
        });
    }
    else if (action.type === "GET_VIDEO_RATING_FULFILLED") {
        return Object.assign({}, state, {
            videoRating: action.payload.rating
        });
    }
    else if (action.type === "GET_VIDEO_RATING_REJECTED") {
        instantview.log("GET_VIDEO_RATING_REJECTED, showing notification");
        return Object.assign({}, state, {
            videoRating: null
        });
    }
}
function handleGetSubscribeStatus(state, action) {
    if (action.type === "GET_SUBSCRIBE_STATUS_PENDING") {
        return Object.assign({}, state, {
            channelSubscribed: false
        });
    }
    else if (action.type === "GET_SUBSCRIBE_STATUS_FULFILLED") {
        return Object.assign({}, state, {
            channelSubscribed: action.payload.subscribed
        });
    }
    else if (action.type === "GET_SUBSCRIBE_STATUS_REJECTED") {
        return Object.assign({}, state, {
            channelSubscribed: false
        });
    }
}
function handleVideoRating(state, action) {
    if (action.type === "RATE_VIDEO_PENDING") {
        return Object.assign({}, state, {
            videoRatingPending: true
        });
    }
    else if (action.type === "RATE_VIDEO_FULFILLED") {
        instantview.rateHandled = true;

        if (action.payload.rating === "like") {
            instantview.stateActions.showToast(instantview.i18n["likeSuccess"]);
        }
        else if (action.payload.rating === "dislike") {
            instantview.stateActions.showToast(instantview.i18n["dislikeSuccess"]);
        }
        else if (action.payload.rating === "none") {
            instantview.stateActions.showToast(instantview.i18n["removeRatingSuccess"]);
        }

        return Object.assign({}, state, {
            videoRating: action.payload.rating,
            videoRatingPending: false
        });
    }
    else if (action.type === "RATE_VIDEO_REJECTED") {
        instantview.rateHandled = true;

        instantview.log("RATE_VIDEO_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["ratingError"]);
        return Object.assign({}, state, {
            videoRating: null,
            videoRatingPending: false
        });
    }
}

function handleChannelSubscribe(state, action) {
    if (action.type === "SUBSCRIBE_TO_CHANNEL_PENDING") {
        return Object.assign({}, state, {
            channelSubscriptionPending: true
        });
    }
    else if (action.type === "SUBSCRIBE_TO_CHANNEL_FULFILLED") {
        instantview.stateActions.showToast(instantview.i18n["subscriptionAdded"]);
        return Object.assign({}, state, {
            channelSubscribed: true,
            channelSubscriptionPending: false
        });
    }
    else if (action.type === "SUBSCRIBE_TO_CHANNEL_REJECTED") {
        instantview.log("SUBSCRIBE_TO_CHANNEL_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["subscribeError"]);
        return Object.assign({}, state, {
            channelSubscribed: false,
            channelSubscriptionPending: false
        });
    }
}
function handleChannelUnsubscribe(state, action) {
    if (action.type === "UNSUBSCRIBE_FROM_CHANNEL_PENDING") {
        return Object.assign({}, state, {
            channelSubscriptionPending: true
        });
    }
    else if (action.type === "UNSUBSCRIBE_FROM_CHANNEL_FULFILLED") {
        instantview.stateActions.showToast(instantview.i18n["subscriptionRemoved"]);
        return Object.assign({}, state, {
            channelSubscribed: false,
            channelSubscriptionPending: false
        });
    }
    else if (action.type === "UNSUBSCRIBE_FROM_CHANNEL_REJECTED") {
        instantview.log("UNSUBSCRIBE_FROM_CHANNEL_REJECTED");
        instantview.stateActions.showToast(instantview.i18n["unsubscribeError"]);
        return Object.assign({}, state, {
            channelSubscribed: false,
            channelSubscriptionPending: false
        });
    }
}

function handleGetAuth(state, action) {
    if (action.type === "GET_AUTH_PENDING") {
        
    }
    else if (action.type === "GET_AUTH_FULFILLED") {

    }
    else if (action.type === "GET_AUTH_REJECTED") {
        instantview.stateActions.showToast(instantview.i18n["authDenied"], 7000);
    }
}

function hideLoadMore() {
    const el = document.querySelector("#iv-comments span.iv-load-more-comments");
    el.style.display = "none";
}

function showLoadMore() {
    const el = document.querySelector("#iv-comments span.iv-load-more-comments");
    el.style.display = "block";
}

// https://stackoverflow.com/a/32638472
function abbreviateNumber(num, fixed) {
    if (num === null) { return null; } // terminate early
    if (num === 0) { return "0"; } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    const b = num.toPrecision(2).split("e"), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d + ["", "K", "M", "B", "T"][k]; // append power
    return e;
}
