import "./index.scss";

import store from "../../store.js";
import watch from "redux-watch";
const w = watch(store.getState, "videoData.videoComments");

import linkify from "linkify-lite";

import Comment from "./Comment.js";
const CommentsPanel = () => {
	const base = document.createElement("div");
	base.setAttribute("id", "iv-comments");

	base.addEventListener("click", e => {

		if (e.target.nodeName === "A" && e.target.href) {
			const currentVideoId = store.getState().videoData.videoId;
			try {
				const url = new URL(e.target.href);
				if (url.host === "www.youtube.com" && url.searchParams.get("v") === currentVideoId && url.searchParams.get("t")) {
					const sec = timeStringToSeconds(url.searchParams.get("t"));
					instantview.player.seekTo(sec);
					e.preventDefault();
				}
			}
			catch(e) {
				// Open the link normally
			}
		}
	});

	const descriptionContainer = document.createElement("div");
	descriptionContainer.setAttribute("id", "iv-video-description-container");

	const description = Comment("DESCRIPTION", "");
	description.classList.add("iv-video-description");
	descriptionContainer.append(description);

	base.append(descriptionContainer);

	const desc = store.getState().videoData.videoDescription;
	store.subscribe(() => {
		const desc = store.getState().videoData.videoDescription;
		if (desc) {
			description.children[1].innerHTML = linkify(desc);
		}
		else {
			description.children[1].innerHTML = "";
		}
	});
	if (desc) {
		description.children[1].innerHTML = linkify(desc);
	}
	else {
		description.children[1].innerHTML = "";
	}

	store.subscribe(w((newVal, oldVal, objectPath) => {
        commentsPanelDataSync(store, base, newVal, oldVal);
    }));
    commentsPanelDataSync(store, base);

	return base;
}

function clearComments(base) {
	const comments = base.getElementsByClassName("iv-comment");
	for (let i = comments.length - 1; i >= 0; i--) {
		const comment = comments[i];
		if (!comment.classList.contains("iv-video-description")) {
			comment.remove();
		}
	}
}

function timeStringToSeconds(time) {
	let seconds = 0;

	const h = time.split("h");
  	const m = (h[1] || time).split("m");
  	const s = (m[1] || time).split("s");
	  
  	if (h[0] && h.length === 2) seconds += parseInt(h[0], 10) * 60 * 60;
  	if (m[0] && m.length === 2) seconds += parseInt(m[0], 10) * 60;
  	if (s[0] && s.length === 2) seconds += parseInt(s[0], 10);

	return seconds;
}

function commentsPanelDataSync(store, base, newVal, oldVal) {
	clearComments(base);
	const channelLink = store.getState().videoData.channelLink;

	if (newVal) {
		for (let i = 0; i < newVal.length; i++) {
			const comment = newVal[i];
			const newComment = Comment(comment.author, comment.text, comment.authorUrl);
			if (channelLink === comment.authorUrl) newComment.classList.add("iv-channel-owner-comment");
			base.append(newComment);
			newComment.animate([{opacity: 0}, {opacity: 1}], 200 + (i * 75));
		}
	}
}

export default CommentsPanel;