export default function svgload(svgString) {
	if (!svgString) throw new Error("An svg string must be provided");
	const container = document.createElement("div");
	container.innerHTML = svgString;
	return container.children[0];
}