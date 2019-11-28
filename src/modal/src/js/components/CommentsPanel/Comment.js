import "./Comment.scss";

const DomPurify = require("dompurify");

const Comment = (commentAuthor, commentText, authorUrl) => {
	const base = document.createElement("div");
	base.classList.add("iv-comment");

	const author = authorUrl ? document.createElement("a") : document.createElement("span");
	const text = document.createElement("p");

	if (authorUrl) {
		author.setAttribute("href", authorUrl);
		author.setAttribute("target", "_blank");
		author.setAttribute("rel", "noopener");
	}

	author.classList.add("iv-comment-author");
	text.classList.add("iv-comment-text");

	author.textContent = commentAuthor;
	text.innerHTML = DomPurify.sanitize(commentText);

	base.append(author, text);

	return base;
};

export default Comment;
