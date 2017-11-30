class sModal extends HTMLElement {

    static get observedAttributes() {
        return ["data-mini"];
    }

    static get openAnimation() {
        return {
            keyframes: [
                {transform: "scale(0.6, 0.6)", opacity: 0},
                {opacity: 1, offset: 0.75},
                {transform: "scale(1, 1)", opacity: 1}
            ],
            duration: 200
        }
    }

    static get closeAnimation() {
        return {
            keyframes: [
                {transform: "scale(1, 1)", opacity: 1},
                {opacity: 0, offset: 0.75},
                {transform: "scale(0.6, 0.6)", opacity: 0}
            ],
            duration: 200
        }
    }

    constructor() {
        super();
        this.dialog = document.createElement("dialog");
        this.addEventListener("click", e => {
            if (e.target.tagName === "DIALOG" && this.closeOptions && this.closeOptions.includes("click")) {
                this.close();
            }
        });
    }
    connectedCallback() {
        
        this.append(this.dialog);

        document.addEventListener("keydown", e => {
            if (this.opened && e.keyCode === 27) {
                e.preventDefault();

                if (this.ytvp.theaterMode) {
                    this.ytvp.theaterMode = false;
                    return;
                }
                if (this.closeOptions && this.closeOptions.includes("escape")) {
                    this.close();
                }
            }
        }, true);

        this.miniExit = document.createElement("button");
        this.miniExit.classList.add("ytvp-mini-exit");
        this.miniExit.innerText = "Expand";

        this.miniExit.addEventListener("click", e => {
            this.mini = false;
        });

        this.append(this.miniExit);

        this.animating = false;

        if (this.opened) {
            this.open(true);
        }

    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-mini") {
            const playerStyles = window.getComputedStyle(this.ytvp);
            const playerColor = playerStyles.getPropertyValue('--player-background-color');
            this.style.backgroundColor = playerColor;
        }
    }

    open(nocheck = false) {
        return new Promise((resolve, reject) => {

            if (!nocheck && !this.opened && !this.animating) {

                if (this.mini) {
                    this.dialog.show();
                }
                else {
                    this.dialog.showModal();
                }

                this.setAttribute("data-open", "");

                // animation stuff

                this.animating = true;

                const animObj = this.constructor.openAnimation;
                const anim = this.dialog.animate(animObj.keyframes, animObj.duration);
                anim.popup = this;

                anim.addEventListener("finish", function() {
                    this.popup.animating = false;
                    this.popup.onOpened();
                });

                const res = function() {
                    this.removeEventListener("ModalOpened", res);
                    resolve();
                }
                this.addEventListener("ModalOpened", res);

                window.currentSModal = this;
            }

        });
    }

    close(animate = true, pause = true) {
        console.log("pausing: " + pause);
        return new Promise((resolve, reject) => {

            if (this.opened && !this.animating) {

                this.removeAttribute("data-open");
                this.onBeforeClosed();

                if (!animate) {
                    this.animating = false;
                    this.dialog.close();
                    this.onClosed();
                    if (pause) this.ytvp.player.pauseVideo();
                    resolve();
                }
                else {

                    // animation stuff

                    this.animating = true;

                    const animObj = this.constructor.closeAnimation;
                    const anim = this.dialog.animate(animObj.keyframes, animObj.duration);
                    anim.popup = this;

                    anim.addEventListener("finish", function() {
                        this.popup.animating = false;
                        this.popup.dialog.close();
                        this.popup.onClosed();
                        if (pause) this.popup.ytvp.player.pauseVideo();
                    });

                    const res = function() {
                        this.removeEventListener("ModalClosed", res);
                        resolve();
                    }
                    this.addEventListener("ModalClosed", res);

                }

                window.currentSModal = null;
            }

        })
    }

    resizeModalVideo() {
        if (this.mini) {
            this.ytvp.resizeVideo(document.body.clientWidth * this.miniWidth, document.body.clientWidth);
        }
        else {
            this.ytvp.resizeVideo();
        }
    }

    get opened() {
        return this.hasAttribute("data-open");
    }

    set closeOptions(options) {
        this.setAttribute("close-options", options.join(","));
    }

    get mini() {
        return this.hasAttribute("data-mini");
    }
    set mini(val) {

        const vidPlaying = this.ytvp.player.getPlayerState() === 1 ? true : false;

        console.log("vidplaying: " + vidPlaying);

        // if we want to switch to mini mode
        if (val && !this.mini) {
            if (this.opened) { 
                this.close(true, !vidPlaying).then(() => {
                    this.setAttribute("data-mini", "");
                    this.resizeModalVideo();
                    this.open();
                });
            }
            else this.setAttribute("data-mini", "");
        }
        else if (!val && this.mini && this.opened) {
            this.close(false, !vidPlaying).then(() => {
                this.removeAttribute("data-mini");
                this.open();
            });
        }
    }

    get miniWidth() {
        const popupStyles = window.getComputedStyle(this);
        return parseFloat(popupStyles.getPropertyValue('--mini-width-percent')); // get css variable
    }

    get closeOptions() {
        let attr = this.getAttribute("close-options");
        if (attr) return attr.replace(" ", "").split(",");
    }

    get ytvp() {
        return this.getElementsByTagName("ytvp-modal")[0];
    }

    // EVENTS //

    onOpened() {
        this.dispatchEvent(new CustomEvent("ModalOpened", {
            detail: this
        }));
    }
    onClosed() {
        this.dispatchEvent(new CustomEvent("ModalClosed", {
            detail: this
        }));
    }
    onBeforeClosed() {
        this.dispatchEvent(new CustomEvent("BeforeModalClosed", {
            detail: this
        }));
    }

}

customElements.define("s-modal", sModal);