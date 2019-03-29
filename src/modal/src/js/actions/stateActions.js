const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import store from "../store.js";

const animations = {
	opening: 	[{transform: "scale(0.6, 0.6)", opacity: 0},
            	{opacity: 1, offset: 0.75},
            	{transform: "scale(1, 1)", opacity: 1}],

    closing: 	[{transform: "scale(1, 1)", opacity: 1},
            	{opacity: 0, offset: 0.75},
            	{transform: "scale(0.6, 0.6)", opacity: 0}]
};

const RATE_TIME_REFRESH = 15 * 1000;

let openedModal = false;

export function openModal(play = true) {
	const state = store.getState().state;
	const modal = document.getElementById("iv-modal");
	const el = document.getElementById("iv-panels");
	const backdrop = document.getElementById("iv-backdrop");

	if (!openedModal) {
		if (mode === prod) {
			chrome.storage.local.get("iv_first_time_auth_denied", items => {
	            if (items && !items.iv_first_time_auth_denied) {
					askForAuth();
	            }
	            chrome.storage.local.get("iv_chrome_bug_acknowledged", items => {
        			if (items && !items.iv_chrome_bug_acknowledged) {
	            		notifyChrome72Bug();
	            	}
	        	});
	        });
		}
		else if (mode === dev) {
			if (!localStorage.getItem("iv_first_time_auth_denied")) {
				askForAuth();
			}
			if (!localStorage.getItem("iv_chrome_bug_acknowledged")) {
				notifyChrome72Bug();
			}
		}

	}

	return {
		type: "OPEN_MODAL",
		payload: () => {
			return new Promise((resolve, reject) => {
				if (el && !state.modalOpen && !state.modalAnimating) {
					modal.setAttribute("data-open", "");

					if (!state.minimized) {
						document.body.style.overflow = "hidden";
					}

	                const anim = el.animate(animations.opening, {duration: 200, easing: "ease-in-out"});
	                // this.backdrop.fadeIn();
	                backdrop.animate([{opacity: 0}, {opacity: 0.85}], 200);

	                anim.addEventListener("finish", e => {
	                	openedModal = true;
	                    if (play) instantview.player.playVideo();
	                    // const overlayedVis = instantview.modal.hasAttribute("data-overlayed-vis");
	                    // const visEnabled = instantview.modal.hasAttribute("data-visualizer");
	                    // if (overlayedVis && visEnabled) instantview.visualizer.start();
	                    resolve(e);
	                });
				}
				else {
					reject("The modal is already opened (data-open attribute)\nMake sure the data isn\'t out of sync");
				}
			});
		}
	}
}

function notifyChrome72Bug() {
	const message = `
		<span style="color: yellow">Video information may fail to load due to an issue affecting Chrome 72+
		<br>Please use the following fix for the time being</span>
		`;
	const fixList = `<ol style=";padding: 10px; padding-left: 30px; margin: 0">
	    <li>Navigate to <span style="color: lightblue">chrome://flags/#network-service</span> in the Chrome address bar
	    <li>Set this to <span style="color: lightblue">Disabled</span></li>
	    <li>Restart Chrome</li>
	</ol>`;

	const dontShowButton = document.createElement("button");
	dontShowButton.classList.add("iv-notification-button");
	dontShowButton.textContent = instantview.i18n["signInNotificationText_DontShow"];
	dontShowButton.addEventListener("click", () => {
		if (mode === prod) {
			chrome.storage.local.set({iv_chrome_bug_acknowledged: true}, function() {
	            // after the data is saved
	        });
		}
		else if (mode === dev) {
			localStorage.setItem("iv_chrome_bug_acknowledged", true);
		}
	});
	dontShowButton.style.marginTop = "0.5vw";
	dontShowButton.style.marginLeft = "0";

	showToast(
		`${message} ${fixList}For more information see <a class="iv-notification-link" href="http://bit.ly/2V0HQzt">here<br></a><span>Sorry for the inconvenience</span><br>`, 
		120 * 1000, 
		[dontShowButton]
	);
}

function askForAuth() {

	const yesButton = document.createElement("button");
	yesButton.classList.add("iv-notification-button");
	yesButton.textContent = instantview.i18n["signInNotificationText_Accept"];

	yesButton.addEventListener("click", () => {

		const pl = instantview.videoDataActions.getAuth();
		pl.payload.then(() => {
			instantview.stateActions.showToast(instantview.i18n["authAccepted"]);
			if (mode === prod) {
				chrome.storage.local.set({iv_first_time_auth_denied: true}, function() {
		            // after the data is saved
		        });
			}
			else if (mode === dev) {
				localStorage.setItem("iv_first_time_auth_denied", true);
			}
		}).catch(e => {
			instantview.stateActions.showToast(instantview.i18n["authDenied"], 7000);
		});
	});

	const noButton = document.createElement("button");
	noButton.classList.add("iv-notification-button");
	noButton.textContent = instantview.i18n["signInNotificationText_Deny"];

	const dontShowButton = document.createElement("button");
	dontShowButton.classList.add("iv-notification-button");
	dontShowButton.textContent = instantview.i18n["signInNotificationText_DontShow"];
	dontShowButton.addEventListener("click", () => {
		if (mode === prod) {
			chrome.storage.local.set({iv_first_time_auth_denied: true}, function() {
	            // after the data is saved
	        });
		}
		else if (mode === dev) {
			localStorage.setItem("iv_first_time_auth_denied", true);
		}
	});

	instantview.stateActions.showToast(instantview.i18n["signInNotificationText"], 30 * 1000, [yesButton, noButton, dontShowButton]);
}

export function closeModal(pause = true, mini = false) {
	const state = store.getState().state;
	const modal = document.getElementById("iv-modal");
	const el = document.getElementById("iv-panels");
	const backdrop = document.getElementById("iv-backdrop");
	return {
		type: "CLOSE_MODAL",
		payload: () => {
			return new Promise((resolve, reject) => {
				if (state.modalAnimating) {
					reject("Cannot close while the modal is animating");
				}
				else {
					if (pause) instantview.player.pauseVideo();

		            const anim = el.animate(animations.closing, 200);
		            backdrop.animate([{opacity: 0.85}, {opacity: 0}], 200);

		            anim.addEventListener("finish", e => {
		                // this.videoPanel.visualiser.stop();
		                // el.removeAttribute("data-visualiser");
		                modal.removeAttribute("data-open");
		                if (!state.minimized) {
							document.body.style.overflow = "auto";
						}
						else {
							instantview.store.dispatch({type: "CLOSE_MODAL_MINI"});
						}
		                // this.onClosed();
		                resolve(e);
		            });
				}
			});
		}
	}
}
export function openVisualizer() {
	return {
		type: "OPEN_VISUALIZER"
	}
}
export function closeVisualizer() {
	return {
		type: "CLOSE_VISUALIZER"
	}
}
export function openComments() {
	return {
		type: "OPEN_COMMENTS"
	}
}
export function closeComments() {
	return {
		type: "CLOSE_COMMENTS"
	}
}
export function minimizeModal() {
	const state = store.getState().state;
	const modal = document.getElementById("iv-modal");
	const videoContainer = document.getElementById("iv-video-container");
	return {
		type: "MINIMIZE_MODAL",
		payload: () => {
			return new Promise((resolve, reject) => {
				if (!state.minimized && !state.modalAnimating) {
					const closeMod = closeModal(false);
					store.dispatch(closeMod);
					closeMod.payload().then(e => {
						if (instantview.customLeft && instantview.customTop) {
							instantview.modal.style.left = instantview.customLeft + "vw";
        					instantview.modal.style.top = instantview.customTop + "vh";
						}
						store.dispatch({type: "MINIMIZE_MODAL_CLOSED"});
						
						videoContainer.resizeHandler(videoContainer);
						
						const openMod = openModal(false);
						store.dispatch(openMod);
						openMod.payload().then(e => {
							resolve();
						});

					});
				}
				else {
					reject("The modal is already minimized, or is animating");
				}
			});
		}
	}
}
export function maximizeModal() {
	const state = store.getState().state;
	const modal = document.getElementById("iv-modal");
	const videoContainer = document.getElementById("iv-video-container");
	return {
		type: "MAXIMIZE_MODAL",
		payload: () => {
			return new Promise((resolve, reject) => {
				if (state.minimized && !state.modalAnimating) {
					const closeMod = closeModal(false)
					store.dispatch(closeMod);
					closeMod.payload().then(e => {
						// remove left and top set by move handle
						modal.style.removeProperty("left");
						modal.style.removeProperty("top");

						store.dispatch({type: "MAXIMIZE_MODAL_CLOSED"});
						
						videoContainer.resizeHandler(videoContainer);

						const openMod = openModal(false);
						store.dispatch(openMod);
						openMod.payload().then(e => {
							resolve();
						});
					});
				}
				else {
					reject("The modal is already maximized, or is animating");
				}
			});
		}
	}
}

export function showToast(text, duration, appendElements = null) {
    const x = document.getElementById("iv-snackbar");
    x.show(text, appendElements, 200, duration).then(() => {
    	if (instantview.notificationQueue.length) {
    		showToast(...instantview.notificationQueue.shift());
    	}
    }).catch(e => {
    	instantview.notificationQueue.push([text, duration, appendElements]);
    });
}

export function performAuthenticatedRequest(callback, errorHandler) {
	performIdentityRequiredRequest(() => {
		instantview.ytapi.getAuth(false).then(() => {
			try {
				callback();
			}
			catch(e) {
				if (e === "OAuthDenied") {
		            instantview.log("OAuth denied, requesting authorization");
		            const pl = instantview.videoDataActions.getAuth();
					pl.payload.then(() => callback(true)).catch(errorHandler);
			        instantview.store.dispatch(pl).catch(errorHandler);
		        }
		        else {
		        	errorHandler();
		        }
			}
		}).catch((e) => {
			instantview.log("OAuth denied, requesting authorization");
			const pl = instantview.videoDataActions.getAuth();
			pl.payload.then(() => callback(true)).catch(errorHandler);
	        instantview.store.dispatch(pl).catch(errorHandler);
		});
	}, errorHandler);
}

export function performIdentityRequiredRequest(callback, errorHandler) {
	getIdentityGranted().then(() => {
        // We have the identity permission
        callback();
    }).catch((e) => {
        // We don't have the identity permission, request it
        requestIdentityPermission().then(() => {
            callback();
        }).catch((e) => {
            // user denied identity permissions
            errorHandler();
            showToast(instantview.i18n["authDenied"]);
        });
    });
}

export async function performWriteRequest(callback, errorHandler, timeLimitHandler) {
	instantview.videoDataActions.getLastWriteRequest().then(lrr => {
        if ((Date.now() - lrr) < RATE_TIME_REFRESH) {
            const timeLeft = (Date.now() - lrr);
            // ceil to avoid '0 more seconds'
            const waitLeft = Math.ceil( (RATE_TIME_REFRESH - timeLeft) / 1000 );
            const sec = waitLeft > 1 ? instantview.i18n["waitText_seconds"] : instantview.i18n["waitText_second"];

            instantview.log(`last write request delta not over threshold, stopping rate request: rate_refresh: ${RATE_TIME_REFRESH} time_waited: ${timeLeft}`);
            let msg = instantview.i18n["thresholdWait"];
            msg = msg.replace("{1}", waitLeft);
            msg = msg.replace("{2}", sec);
            showToast(msg);
            if (timeLimitHandler) timeLimitHandler(timeLeft);

            return;
        }
        else {
        	callback();
        }
	}).catch(e => {
		callback();
	});
}

export function requestIdentityPermission() {
	return new Promise((resolve, reject) => {
		if (mode === dev) {
			setTimeout(() => {
				const permissionGranted = true;
				if (permissionGranted) {
					resolve();
				}
				else {
					reject();
				}
			}, 200);
		}
		else if (mode === prod) {
			chrome.runtime.sendMessage({message: "request_permissions"}, response => {
		        if (response) {
		            resolve();
		        }
		        else {
		            reject();
		        }
		    });
		}
	});
}

export function getIdentityGranted() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({message: "get_permissions"}, response => {
	        if (response) {
	            resolve();
	        }
	        else {
	            reject();
	        }
	    });
	});
}

