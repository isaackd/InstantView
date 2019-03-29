const mode = process.env.NODE_ENV;
const prod = "production";
const dev = "development";

import "./index.scss";

import { Visualizer } from "./Visualizer.js";
import * as Visuals from "./Visuals.js";

import Module from "./Module.js";

import * as stateActions from "../../actions/stateActions.js";

import svgload from "../../libs/svgload.js";
import BackIcon from "../../../icons/arrow_back.svg"
    
const VisualizerPanel = (store) => {
	const base = document.createElement("div");
	base.setAttribute("id", "iv-visualizer");

	const canvas = document.createElement("canvas");
	canvas.setAttribute("id", "iv-visualizer-canvas");
	canvas.setAttribute("width", "1280");
	canvas.setAttribute("height", "720");

	const vis = new Visualizer(canvas);
	const modules = addModules();

	// create the callback for when the canvas-container size changes
    const ro = new ResizeObserver(entries => {
        resizeCanvas(base, canvas, vis);
    });
    // start observing the video-container
    ro.observe(base);

	const header = document.createElement("div");
	header.setAttribute("id", "iv-visualizer-header");

	const backArrow = svgload(BackIcon);
	backArrow.setAttribute("id", "iv-visualizer-back");
	backArrow.setAttribute("width", "24");
	backArrow.setAttribute("height", "24");
	backArrow.addEventListener("click", () => {
		const state = store.getState().state;
        if (!state.visualizerOpen) {
            store.dispatch(stateActions.openVisualizer());
        }
        else {
            store.dispatch(stateActions.closeVisualizer());
        }
	});

	const footer = document.createElement("div");
	footer.setAttribute("id", "iv-visualizer-footer");

	header.append(backArrow);
	footer.append(...modules);

	instantview.visualizer = vis;

	base.append(canvas, header, footer);
	base.resizeCanvas = resizeCanvas;
	base.canvas = canvas;
	base.vis = vis;
	return base;
}

function addModules() {
	const moduleElements = [];

    for (const module in Visuals) {
        const modEl = Module(module);
        modEl.addEventListener("click", e => {
            const modName = modEl.getAttribute("data-name");
            const modClass = findModule(modName);

            if (instantview.visualizer.module) {
            	const currentModName = instantview.visualizer.module.constructor.moduleName;
            	if (currentModName === modClass.moduleName) {
            		return;
            	}
            }


            // if (modEl.hasAttribute("data-active")) {
            //     modEl.removeAttribute("data-active");
            //     this.stop();
            // }
            if (modClass) {
                removeActiveModules();
                modEl.setAttribute("data-active", "");
                useModule(modClass);
                if (mode === prod) {
                	chrome.storage.local.set({iv_last_vis: modName}, function() {
	                    // data is saved
	                });
                }
                // if (!this.active) this.start();
            }
        });
        
        moduleElements.push(modEl);
    }
    return moduleElements;
}

function findModule(name, el = false) {
    if (el) {
        const modules = document.body.getElementsByClassName("iv-visualizer-module");
        for (const module of modules) {
            const modName = module.getAttribute("data-name");
            if (module && name === modName) {
                return module;
            }
        }
    }
    else {
        for (const module in Visuals) {
            if (module === name) {
                return Visuals[module];
            }
        } 
    }
}

function useModule(module) {
    const moduleName = module.moduleName;
    const modEl = findModule(moduleName, true);

    if (modEl) {
        modEl.setAttribute("data-active", "");
        const vis = instantview.visualizer;
        vis.module = new module(vis, instantview.analyzer.fftSize);
    }
}

function removeActiveModules() {
    const activeModules = document.body.querySelectorAll(".iv-visualizer-module[data-active]");
    for (const mod of activeModules) {
        mod.removeAttribute("data-active");
    }
}

function resizeCanvas(base) {
	const nw = base.offsetWidth;
    const nh = base.offsetHeight;
    base.canvas.width = nw;
    base.canvas.height = nh;
    base.vis.w = nw;
    base.vis.h = nh;
}

export default VisualizerPanel;