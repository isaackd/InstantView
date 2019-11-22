let currentDataSource = YOUTUBE_DATA_SOURCE;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "get_video_data") {
		currentDataSource.handleGetVideoData(request, sender, sendResponse);
	}
	else if (request.message === "get_channel_data") {
		currentDataSource.handleGetChannelData(request, sender, sendResponse);
	}
	else if (request.message === "get_comment_data") {
		currentDataSource.handleGetCommentData(request, sender, sendResponse);
	}
	return true;
});
