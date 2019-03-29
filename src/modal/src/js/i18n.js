const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

instantview.i18n = {};

function dp(name, fn) {
	if (mode === prod) {
		Object.defineProperty(instantview.i18n, name, {
			get: fn
		});
	}
	else if (mode === dev) {
		Object.defineProperty(instantview.i18n, name, {
			value: fn,
			writable: false
		});
	}
}

if (mode === prod) {
	dp("signInNotificationText", () => chrome.i18n.getMessage("signInNotificationText"));
	dp("signInNotificationText_Accept", () => chrome.i18n.getMessage("signInNotificationText_Accept"));
	dp("signInNotificationText_Deny", () => chrome.i18n.getMessage("signInNotificationText_Deny"));
	dp("signInNotificationText_DontShow", () => chrome.i18n.getMessage("signInNotificationText_DontShow"));
	dp("authAccepted", () => chrome.i18n.getMessage("authAccepted"));
	dp("authDenied", () => chrome.i18n.getMessage("authDenied"));
	dp("identityDenied", () => chrome.i18n.getMessage("identityDenied"));
	dp("thresholdWait", () => chrome.i18n.getMessage("thresholdWait"));
	dp("retrieveDataFail_Video", () => chrome.i18n.getMessage("retrieveDataFail_Video"));
	dp("retrieveDataFail_Channel", () => chrome.i18n.getMessage("retrieveDataFail_Channel"));
	dp("retrieveDataFail_Comment", () => chrome.i18n.getMessage("retrieveDataFail_Comment"));
	dp("subscriptionAdded", () => chrome.i18n.getMessage("subscriptionAdded"));
	dp("subscriptionRemoved", () => chrome.i18n.getMessage("subscriptionRemoved"));
	dp("subscribeError", () => chrome.i18n.getMessage("subscribeError"));
	dp("unsubscribeError", () => chrome.i18n.getMessage("unsubscribeError"));
	dp("likeSuccess", () => chrome.i18n.getMessage("likeSuccess"));
	dp("dislikeSuccess", () => chrome.i18n.getMessage("dislikeSuccess"));
	dp("removeRatingSuccess", () => chrome.i18n.getMessage("removeRatingSuccess"));
	dp("ratingError", () => chrome.i18n.getMessage("ratingError"));
	dp("waitText_second", () => chrome.i18n.getMessage("waitText_second"));
	dp("waitText_seconds", () => chrome.i18n.getMessage("waitText_seconds"));
}
else if (mode === dev) {
	dp("signInNotificationText", "Would you like to give InstantView access to your YouTube account for subscribing to channels and rating videos?");
	dp("signInNotificationText_Accept", "yes");
	dp("signInNotificationText_Deny", "no");
	dp("signInNotificationText_DontShow", "don't show again");
	dp("authAccepted", "You can now subscribe to channels and rate videos!");
	dp("authDenied", "InstantView needs access to your account to be able to rate videos and subscribe to channels...");
	dp("identityDenied", "InstantView needs the 'identity' permission to rate videos and subscribe to channels.");
	dp("thresholdWait", "Please wait <span style=\"color: var(--iv-channel-owner-color)\">{1}</span> more {2} to subscribe or rate again.");
	dp("retrieveDataFail_Video", "Couldn't retrieve video data :/");
	dp("retrieveDataFail_Channel", "Couldn't retrieve channel data :/");
	dp("retrieveDataFail_Comment", "Couldn't retrieve comment data :/");
	dp("subscriptionAdded", "Subscription added...");
	dp("subscriptionRemoved", "Subscription removed...");
	dp("subscribeError", "An error occurred while trying to subscribe. Please try again later.");
	dp("unsubscribeError", "An error occurred while trying to unsubscribe. Please try again later.");
	dp("likeSuccess", "Added to liked videos...");
	dp("dislikeSuccess", "Added to disliked videos...");
	dp("removeRatingSuccess", "Removed rating from video...");
	dp("ratingError", "An error occurred while trying to rate the video. Please try again later.");
	dp("waitText_second", "second");
	dp("waitText_seconds", "seconds");
}