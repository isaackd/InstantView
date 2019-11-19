import "./SubscribeButton.scss";

import svgload from "../../libs/svgload.js";

import SubscribeIcon from "../../../icons/add.svg";
import SubscribedIcon from "../../../icons/check.svg";

import SpinnerIcon      from "../../../icons/spinner.svg";

const SubscribeButton = (store) => {
	const base = document.createElement("button");
	base.classList.add("iv-subscribe-button");

	const subStatus = document.createElement("span");
	subStatus.classList.add("iv-channel-subscribe-status");

	const subscribers = document.createElement("span");
	subscribers.classList.add("iv-channel-subscribers");

	const subIcon = svgload(SubscribeIcon);
	subIcon.classList.add("iv-channel-subscribe-icon");

	const subbedIcon = svgload(SubscribedIcon);
	subbedIcon.classList.add("iv-channel-subscribe-icon");
	subbedIcon.setAttribute("display", "none");

	const spinner = svgload(SpinnerIcon);

    spinner.classList.add("iv-channel-subscribe-icon");
	spinner.setAttribute("id", "iv-subscribe-spinner");

	base.append(spinner, subIcon, subbedIcon, subStatus, subscribers);

	store.subscribe(() => {
		subscribeButtonDataSync(store, subStatus, subscribers, subIcon, subbedIcon, spinner);
	});

	// setup store connection and data
    subscribeButtonDataSync(store, subStatus, subscribers, subIcon, subbedIcon, spinner);

	return base;
};

function subscribeButtonDataSync(store, subStatus, subs, subIcon, subbedIcon, spinner) {
	const data = store.getState().videoData;

	if (data.channelSubscribed) {
		subbedIcon.removeAttribute("display");
		subIcon.setAttribute("display", "none");
	}
	else {
		subIcon.removeAttribute("display");
		subbedIcon.setAttribute("display", "none");
	}

	subStatus.textContent = data.channelSubscribed ?
		"Subscribed" : "Subscribe";
	subs.textContent = data.channelSubscribers ?
		data.channelSubscribers : "N/A";

    if (!data.channelSubscriptionPending) {
        if (data.channelSubscribed) {
        	subbedIcon.style.removeProperty("display");
        }
        else {
        	subIcon.style.removeProperty("display");
        }
        spinner.classList.remove("active");
    }
    else {
    	subbedIcon.style.display = "none";
    	subIcon.style.display = "none";

        spinner.classList.add("active");
    }

}

export default SubscribeButton;
