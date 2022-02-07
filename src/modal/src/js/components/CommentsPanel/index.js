import "./index.css";

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

	const commentsContainer = document.createElement("div");
	commentsContainer.setAttribute("id", "iv-video-comments-container");

	const loadMore = document.createElement("span");
	loadMore.textContent = "Load More";
	loadMore.classList.add("iv-load-more-comments");

	loadMore.addEventListener("click", e => {
		if (!store.getState().videoData.commentsLoading) {
			store.dispatch(instantview.videoDataActions.getMoreCommentData()).catch(e => {
				
			});
		}
	});

	base.append(descriptionContainer, commentsContainer, loadMore);

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
        commentsPanelDataSync(store, commentsContainer, newVal, oldVal);
    }));
    commentsPanelDataSync(store, base);

	return base;
};

function clearComments(base, oldCommentIds = []) {
	let reused = 0;

	const commentsDisabledEl = document.getElementById("iv-comments-disabled");
	if (commentsDisabledEl) {
		commentsDisabledEl.remove();
	}

	const comments = base.getElementsByClassName("iv-comment");
	for (let i = comments.length - 1; i >= 0; i--) {
		const comment = comments[i];

		if (!comment.classList.contains("iv-video-description")) {
			if (!oldCommentIds.includes(comment.commentData.id)) {
				comment.remove();
			}
			else {
				reused++;
			}
		}
	}
}

function timeStringToSeconds(time) {
	let seconds = 0;

	const h = time.split("h");
  	const m = (h[1] || time).split("m");
  	const s = (m[1] || time).split("s");
	  
  	if (h[0] && h.length === 2) {
  		seconds += parseInt(h[0], 10) * 60 * 60;
  	}

  	if (m[0] && m.length === 2) {
  		seconds += parseInt(m[0], 10) * 60;
  	}

  	if (s[0] && s.length === 2) {
  		seconds += parseInt(s[0], 10);
  	}


	return seconds;
}

function hideLoadMore() {
	const el = document.querySelector("#iv-comments span.iv-load-more-comments");
	el.style.display = "none";
}

function showLoadMore() {
	const el = document.querySelector("#iv-comments span.iv-load-more-comments");
	el.style.display = "block";
}

function commentsPanelDataSync(store, base, newVal, oldVal) {
	const data = store.getState();

	const videoId = data.videoData.videoId;
	const channelLink = data.videoData.channelLink;

	const reusableComments = [];
	if (!data.videoData.commentsDisabled && oldVal) {
		for (const oldComment of oldVal) {
			if (oldComment.videoId === videoId) {
				reusableComments.push(oldComment.id);
			}
		}
	}

	clearComments(base, reusableComments);

	if (data.videoData.commentsDisabled) {
		const cdel = document.createElement("span");
		cdel.setAttribute("id", "iv-comments-disabled");
		cdel.textContent = "Comments are disabled";
		base.append(cdel);
		return;
	}

	if (newVal) {

		let animationMultiplier = 0;

		for (let i = 0; i < newVal.length; i++) {
			const comment = newVal[i];

			if (!reusableComments.includes(comment.id)) {
				const newComment = Comment(comment.author, comment.text, comment.authorUrl);
				newComment.commentData = comment;

				if (channelLink === comment.authorUrl) {
					newComment.classList.add("iv-channel-owner-comment");
				}

				base.append(newComment);
				newComment.animate([{opacity: 0}, {opacity: 1}], 200 + (animationMultiplier * 75));
				animationMultiplier++;
			}
		}
	}
}

export default CommentsPanel;
