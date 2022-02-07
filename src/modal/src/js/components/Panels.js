import "./Panels.css";

import VideoPanel from "./VideoPanel.js";
import VisualizerPanel from "./VisualizerPanel";
import CommentsPanel from "./CommentsPanel";

const Panels = (store, modal) => {
	const base = document.createElement("div");
	base.setAttribute("id", "iv-panels");

	const videoPanel = VideoPanel(store, modal);
	const visualizerPanel = VisualizerPanel(store);
	const commentsPanel = CommentsPanel();

	base.append(videoPanel, visualizerPanel);
	base.append(commentsPanel);

	return base;
};

export default Panels;
