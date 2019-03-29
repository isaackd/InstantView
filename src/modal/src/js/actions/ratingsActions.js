const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import { performAuthenticatedRequest, performWriteRequest } from "./stateActions.js";
import { subscribeToChannel, unsubscribeFromChannel, rateVideo } from "./videoDataActions";

import { getSubscriptionStatus, getVideoRating } from "../libs/ytapi.js";

export function handleSubscribeClick() {
	return {
		type: "SUBSCRIBE_CLICK",
		payload: new Promise((resolve, reject) => {

			const state = instantview.store.getState();
			if (state.ratings.handlingSubscribeClick || !state.videoData.channelId) {
				reject();
				return;
			}

			performAuthenticatedRequest((authAccepted) => {
				if (authAccepted) {
					instantview.stateActions.showToast(instantview.i18n["authAccepted"]);
					if (mode === prod) {
						chrome.storage.local.set({iv_first_time_auth_denied: true}, function() {
				            // after the data is saved
				        });
					}
					else if (mode === dev) {
						localStorage.setItem("iv_first_time_auth_denied", true);
					}
					resolve();
					return;
				}

				// We have identity permission and authentication
				performWriteRequest(async () => {
					const channelId = state.videoData.channelId;
					getSubscriptionStatus(channelId).then(subStatus => {
						if (!subStatus.subscribed) {
							const action = subscribeToChannel(channelId);
							instantview.store.dispatch(action).catch(reject);
							action.payload.then(() => {
								resolve();
							}).catch(reject);
						}
						else {
							const action = unsubscribeFromChannel(subStatus.id);
							instantview.store.dispatch(action).catch(reject);
							action.payload.then(() => {
								resolve();
							}).catch(reject);
						}
					}).catch(reject);
				}, () => {
					// Error handler
					reject();
				}, () => {
					// Time limit handler
					reject();
				});
	
			}, () => {
				// Error handler
				reject();
			});

		})
	}
}

export function handleRateButtonClick(rating) {
	if (!rating) throw new Error(`A rating must be provided`);
	return {
		type: "RATE_BUTTON_CLICK",
		payload: new Promise((resolve, reject) => {

			const state = instantview.store.getState();
			if (state.ratings.handlingRateButtonClick || !state.videoData.videoId) {
				reject();
				return;
			}

			performAuthenticatedRequest((authAccepted) => {

				if (authAccepted) {
					instantview.stateActions.showToast(instantview.i18n["authAccepted"]);
					if (mode === prod) {
						chrome.storage.local.set({iv_first_time_auth_denied: true}, function() {
				            // after the data is saved
				        });
					}
					else if (mode === dev) {
						localStorage.setItem("iv_first_time_auth_denied", true);
					}
					resolve();
					return;
				}

				performWriteRequest(() => {
					const videoId = state.videoData.videoId;
					getVideoRating(videoId).then(rateStatus => {
						if (rating !== rateStatus.rating) {
							if (rating === "like") {
								// like the video

								const likeButton = document.getElementById("iv-like-button")

								const icon = likeButton.querySelectorAll("svg")[1];
								const spinner = document.getElementById("iv-like-spinner");

								icon.style.display = "none";
								spinner.classList.add("active");

								const action = rateVideo(videoId, "like");
								instantview.store.dispatch(action).catch(reject);
								action.payload.then(() => {
									resolve();
								}).catch(reject);

							}
							else if (rating === "dislike") {
								// dislike the video

								const dislikeButton = document.getElementById("iv-dislike-button")

								const icon = dislikeButton.querySelectorAll("svg")[1];
								const spinner = document.getElementById("iv-dislike-spinner");

								icon.style.display = "none";
								spinner.classList.add("active");

								const action = rateVideo(videoId, "dislike");
								instantview.store.dispatch(action).catch(reject);
								action.payload.then(() => {
									resolve();
								}).catch(reject);
							}
						}
						else {
							// remove the rating from the video

							const button = document.getElementById(`iv-${rating}-button`)

							const icon = button.querySelectorAll("svg")[1];
							const spinner = document.getElementById(`iv-${rating}-spinner`);

							icon.style.display = "none";
							spinner.classList.add("active");

							const action = rateVideo(videoId, "none");
							instantview.store.dispatch(action).catch(reject);
							action.payload.then(() => {
								resolve();
							}).catch(reject);
						}
					}).catch(reject);
				}, () => {
					reject();
				}, () => {
					reject();
				});
			}, () => {
				reject();
			});
		})
	}
}