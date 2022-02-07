import "./Snackbar.css";

instantview.notificationQueue = [];

const Snackbar = () => {
	const base = document.createElement("div");
	base.setAttribute("id", "iv-snackbar");

	base.__id = 0;
	base.__closed = true;

	base.addEventListener("click", e => {
		base.__id++;
		base.hide(200, 0).then(() => {
			base.__resolveShow();
		});
	});

	base.show = (text, appendElements = null, duration = 500, hideDelay = 3000) => {

		instantview.log(`SHOWING SNACKBAR: text: ${text}, duration: ${duration}, hideDelay: ${hideDelay}`);

		const x = new Promise((resolve, reject) => {
			if (base.__closed && !base.animating) {
				base.__closed = false;
				base.animating = true;
				base.__resolveShow = resolve;

				base.style.display = "block";
				base.innerHTML = text;

				if (appendElements) {
					base.append(...appendElements);
				}

				const anim = base.animate([
					{bottom: 0, opacity: 0}, 
					{bottom: "2vw", opacity: 1}], 
				{ duration: duration, fill: "forwards" });

				const id = base.__id;

				anim.addEventListener("finish", () => {
					base.animating = false;
					setTimeout(() => {
						if (base.__id === id) {
							base.hide(200).then(() => {
								resolve();
							});
						}
					}, hideDelay);
			    });
			}
			else {
				reject(new Error("Already animating snackbar (show)"));
			}
		});
		return x;
	};

	base.hide = (duration = 200) => {
		return new Promise((resolve, reject) => {
			if (!base.animating) {
				base.animating = true;
				const anim = base.animate([
					{bottom: "2vw", opacity: 1}, 
					{bottom: 0, opacity: 0}], 
				{ duration: duration, fill: "forwards" });

				anim.addEventListener("finish", () => {
					base.animating = false;
					base.__closed = true;
					base.style.display = "none";
			    	resolve();
			    });
			}
			else {
				reject(new Error("Already animating snackbar (hide)"));
			}
		});
	};

	return base;
};

export default Snackbar();
