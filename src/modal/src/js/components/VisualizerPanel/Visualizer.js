export class Visualizer {

    constructor(canvas, audio, fftSize) {
    	this.c = canvas;

        this.active = false;
        this.update = this.update.bind(this);
        // create an array to hold all of the frequency data
        this.byteFrequencyData = new Uint8Array(1024);

        this.lastTime = 0;

        this.setupShortcuts();
        // if (audio) this.setupAudio(audio, fftSize);
    }
    // commonly used functions and variables
    setupShortcuts() {
        this.x = this.c.getContext("2d");

        this.S = Math.sin;
        this.C = Math.cos;
        this.T = Math.tan;

        this.P = Math.PI;
        this.P2 = this.P * 2;

        this.w = this.c.width;
        this.h = this.c.height;
        // quickly make an rgba color string
        // for use with x.fillStyle
        this.R = function(r,g,b,a) {
            a = a === undefined ? 1 : a;
            // clamp between 0 and 1
            a = a > 1 ? 1 : a < 0 ? 0 : a;
            return `rgba(${r|0}, ${g|0}, ${b|0}, ${a})`;
        };
        this.lc = function(a, b, amount) {
            const ar = a >> 16,
                  ag = a >> 8 & 0xff,
                  ab = a & 0xff,

                  br = b >> 16,
                  bg = b >> 8 & 0xff,
                  bb = b & 0xff,

                  rr = ar + amount * (br - ar),
                  rg = ag + amount * (bg - ag),
                  rb = ab + amount * (bb - ab);

            return (rr << 16) + (rg << 8) + (rb | 0);
        };
        // interp between two values
        this.l = function(start, end, amt) {
            return (1-amt) * start + amt * end
        }
        // clear the canvas
        this.cls = function(sx = 0, sy = 0, ex = this.w, ey = this.h) {
            this.x.clearRect(sx, sy, ex, ey);
        }
    }
    // setup the analyzer so we can get the frequency data
    setupAudio(audio, fftSize = 2048) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const analyzer = context.createAnalyser();
        // increase for higher resolution but less performance
        analyzer.fftSize = fftSize;
        const byteFrequencyData = new Uint8Array(analyzer.frequencyBinCount);
        // use the audio element passed in to the constructor
        const source = context.createMediaElementSource(audio);
        source.connect(analyzer);
        analyzer.connect(context.destination);

        this.analyzer = analyzer;
    }
    // called each frame 
    // 60fps on most monitors (if the computer can handle it)
    update() {
        if (this.active && this.module) {
            // update again
            requestAnimationFrame(this.update);
            // for animating using time. constantly increases
            const currentTime = performance.now() / 1000;
            // get the frequency data from the audio source's analyzer
            this.analyzer.getByteFrequencyData(this.byteFrequencyData);
            // save the current state of the canvas (colors, rotation, etc)
            // so we can restore it once the module is done drawing
            this.x.save();
            // let the module draw onto the canvas
            this.module.update(currentTime, this, this.byteFrequencyData);
            // restore the state of the canvas so if the module is switched, 
            // the canvas will be in a fresh state again
            this.x.restore();
        }
    }

    start() {
        // if we aren't already active, start updating
        if (!this.active) {
            this.active = true;
            this.update();
        }
    }
    // stop updating and clear the screen
    stop() {
        this.active = false;
        this.cls();
    }
    // set the module being drawn to the canvas
    useModule(module) {
        this.module = new module(this, this.analyzer.fftSize);
    }
}

export class Analyzer {
    static get moduleName() {
        return "Analyzer";
    }

    constructor() {
        // width of each bar
        this.width = 25;
        // spacing between each bar
        this.spacing = 3;
        // starting x and y position
        this.x = 0;
        this.y = 0;
        // position in the frequency array to start from
        this.freqOffset = 0;
        // y position of the bar caps
        this.threshold = 255;
        // height of the bar caps
        this.thresholdHeight = 2;
        // color of the bars
        this.primaryColor = "#b8ff88";
        // color of the bar caps
        // color of the bars once they're >= threshold
        this.secondaryColor = "#b0b0b0";

    }
    // called each frame
    update(time, vis, freqs) {

        const barOff = (this.width + this.spacing)
        // automatically calculate the amount of bars that should be shown using
        // the width of the canvas
        const amount = ((vis.w - this.x) / (this.width + this.spacing)) - 2;

        for (let i = 0; i < amount; i++) {

            let freq = freqs[i];

            let x = (i * barOff) + ((this.width / 2) + this.x);
            let y = vis.h - this.y;

            let w = this.width;
            let h = freqs[i + this.freqOffset];


            vis.x.font = "12px Tahoma";
            vis.x.fillStyle = this.primaryColor;

            vis.x.fillText(freqs[i + this.freqOffset], x + (this.width / 2) - 10, (vis.h - this.threshold) - this.thresholdHeight - 10);
            vis.x.fillText(i + this.freqOffset, x + (this.width / 2) - 10, (vis.h - this.threshold) - this.thresholdHeight - 30);

            vis.x.font = "8px Tahoma";
            const txty = (vis.h - this.threshold) - this.thresholdHeight - ((i % 2 === 0) ? 50 : 60)
            vis.x.fillText(`${((44100 / 2048) * i).toFixed(0)}hz`, x + (this.width / 2) - 10, txty);

            if (freq >= this.threshold) {vis.x.fillStyle = this.secondaryColor}
            else {vis.x.fillStyle = this.primaryColor}
            // draw the bars
            vis.x.fillRect(x, y, w, -h);
            // draw the bar caps
            vis.x.fillStyle = this.secondaryColor;
            vis.x.fillRect(x, y - this.threshold, w, this.thresholdHeight);
        }

    }
}