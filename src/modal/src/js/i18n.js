const i18nStrings = [
	"signInNotificationText", "signInNotificationText_Accept",
	"signInNotificationText_Deny", "signInNotificationText_DontShow",
	"authAccepted", "authDenied", "identityDenied", "thresholdWait",
	"retrieveDataFail_Video", "retrieveDataFail_Channel",
	"retrieveDataFail_Comment", "subscriptionAdded",
	"subscriptionRemoved", "subscribeError", "unsubscribeError",
	"likeSuccess", "dislikeSuccess", "removeRatingSuccess",
	"ratingError", "waitText_second", "waitText_seconds"
];

instantview.i18n = {};

for (const str of i18nStrings) {
	Object.defineProperty(instantview.i18n, str, {
		get: () => chrome.i18n.getMessage(str)
	});
}
