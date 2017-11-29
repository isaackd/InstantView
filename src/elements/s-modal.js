class sModal extends HTMLElement {

  	constructor() {
  		super();

  		this.dialog = document.createElement("dialog");

  		this.addEventListener("click", e => {
  			if (e.target.tagName === "DIALOG" && this.closeOptions && this.closeOptions.includes("click")) {
  				this.close();
  			}
  		});

  		this.addEventListener("transitionend",  e => {
  			if (e.propertyName === "transform") {
  				if (!this.opened) {
                    this.dialog.close();
                    this.onClosed();
                }
                else {
                    this.onOpened();
                }
  				this.animating = false;
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

        this.animating = false;

  		if (this.opened) {
  			this.open(true);
  		}

        this.setAttribute("data-mini", "");

  	}

  	open(nocheck = false) {
        if (!this.opened && !this.animating || !nocheck) {
            this.animating = true;

            if (this.mini) {
                console.log("mini");
                this.dialog.show();
            }
            else {
                console.log("modal");
                this.dialog.showModal();
            }


            this.setAttribute("data-open", "");
            window.currentSModal = this;
        }
  	}

  	close() {
        if (this.opened && !this.animating) {
            this.animating = true;
            this.removeAttribute("data-open");
            this.onBeforeClosed();
            window.currentSModal = null;
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
        val ? this.setAttribute("data-mini", "") : this.removeAttribute("data-mini");
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