// dark
instantview.visBlue = "#1E90FF";
instantview.visGreen = "#00b060";
// light
instantview.visPink = "#d10a64";
instantview.visBlack = "#000000";

instantview.visPrimaryColor = instantview.visPink;
instantview.visSecondaryColor = instantview.visBlack;

import "./Curve.js";

// import Pumpkin from "../../../images/pumpkin.png";

// const pumpkin = (window.chrome && chrome.runtime && chrome.runtime.getURL)
//     ? chrome.runtime.getURL("src/modal/dist/" + Pumpkin)
//     : Pumpkin;

class VerticalBars {

    static get moduleName() {
        return "VerticalBars";
    }

    constructor(vis, fftSize) {
        this.fy = new Uint8Array(fftSize / 2);
        // width of the bars
        this.width = 10;
        // space between the bars (in px)
        this.spacing = 2;
        // height of the mini bars on top of the larger ones
        this.floaterHeight = 5;
        // used to calculate where the bars should be on the x coordinate
        this.xOffset = this.width + (this.spacing * 2);

        // horizontal padding (in px)
        this.horiPadding = 200;

    }

    update(t, vis, freqs) {

        let setCol = false;

        const bars = vis.w / this.xOffset - (this.horiPadding / this.width);
        const groupWidth = bars * this.xOffset;

        vis.cls();
        // draw the bars
        vis.x.strokeStyle = instantview.visPrimaryColor;
        vis.x.fillStyle = instantview.visPrimaryColor;
        for (let i = 0; i < bars; i++) {

            const x = ~~(((vis.w / 2) - (groupWidth / 2)) + (i * this.xOffset));
            const y = vis.h - 50;
            const f = freqs[i];

            vis.x.fillRect(x, y, this.width, -f);

            if (f > this.fy[i]) {
                this.fy[i] = f;
            }
            else if (this.fy[i] > this.floaterHeight) {
                this.fy[i] -= 1;
            }

            const screenY = y - Math.max(this.fy[i], this.floaterHeight) - 15;

            // const col = "#" + vis.interp(this.colorMin, this.colorMax, f / 256).toString(16);
            // if (!setCol) vis.x.fillStyle = col; setCol = true;
            vis.x.strokeRect(x, screenY, this.width, this.floaterHeight);
        }
    }
}

class CircularBars {
    static get moduleName() {
        return "CircularBars";
    }

    constructor() {
        this.amount = 100;

        this.inward = false;
        this.totalAngle = 360;
        this.autoRotate = false;
    }

    update(t, vis, freqs) {
        vis.cls();
        // convert from degrees to radians
        const angle = (this.totalAngle * (vis.P / 180)) / this.amount;

        const radius = vis.w / 8;
        const lineWidth = vis.w / 300;
        const height = vis.w / 200;

        const intrude = vis.w / 100;
        const arcIntrude = 40;

        vis.x.fillStyle = instantview.visSecondaryColor;
        vis.x.strokeStyle = instantview.visSecondaryColor;

        // vis.x.save();
        vis.x.translate(vis.w / 2, vis.h / 2);
        for (let i = 0; i < this.amount; i++) {
            vis.x.rotate(angle);
            const x = this.inward ? -radius : radius;
            if (i !== 0 && i % 3 === 0) {
                vis.x.fillRect(x - intrude, -(height / 2), Math.max(freqs[i] / 2, 5), height);
            } 
            else {
                vis.x.fillRect(x, -(height / 2), Math.max(freqs[i] / 2, 5), height);
            }
        }
        // vis.x.restore();

        vis.x.translate(-vis.w / 2, -vis.h / 2);

        let avg = 0;
        for (let i = 0; i < this.amount; i++) {avg += freqs[i]}
        avg /= this.amount;

        vis.x.translate(vis.w / 2, vis.h / 2);
        vis.x.beginPath();
        vis.x.arc(0, 0, Math.max(Math.min((avg / 255) * radius, radius - arcIntrude), 20), 0, vis.P2);
        vis.x.closePath();
        vis.x.lineWidth = lineWidth;
        vis.x.stroke();
        vis.x.translate(-vis.w / 2, -vis.h / 2);

        if (this.autoRotate) {
            this.totalAngle++;
            if (this.totalAngle > 100000) {
                this.totalAngle = 720;
            }
        }
    }
}

class Quadratics {
    static get moduleName() {
        return "Quadratics";
    }

    constructor(vis) {

        this.width = 5;

        this.spacing = 20;

        this.x = 200;
        this.y = vis.h / 1.2;

    }

    update(time, vis, freqs) {
        vis.x.fillStyle = instantview.visPrimaryColor;
        vis.x.strokeStyle = instantview.visPrimaryColor;
        vis.x.lineJoin = 'round';

        vis.cls();

        const amount = vis.w / (this.width + this.spacing) + 3;

        const groupWidth = amount * (this.spacing + this.width);

        const xtrans = (vis.w / 2) - groupWidth / 2;

        const points = [0, vis.h];

        for (let i = 0; i < amount; i++) {
            const x = i * (this.spacing + this.width);
            const y = -freqs[i];
            points.push(x, y);
        }

        points.push(vis.w - 50, vis.h);

        vis.x.fillStyle = instantview.visPrimaryColor;

        vis.x.translate(xtrans, vis.h / 1.2);
        vis.x.beginPath();
        vis.x.curve(points, 0.5, 25, true);
        vis.x.fill();
        vis.x.closePath();



    }
}
// I was scrolling through random dweets (dwitter.net) and accidentally
// refreshed so I can't credit this code until I can find it again :/
class Plaid {
    static get moduleName() {
        return "Plaid";
    }

    constructor() {
        this.s = 60;
    }

    update(time, vis, freqs) {
        const t = time;
        let {c, x, R, i, S, C, T} = vis;

        vis.cls();
        const speedModifier = ((parseFloat(instantview.animationSpeed, 10) / 100) || 0.70);

        for(let i=0;i<=vis.w;i+=this.s) {
            for(let j=0;j<=vis.h;j+=this.s) {

                const r = C((i + (t * speedModifier))) * 255;
                const g = C(((t * speedModifier) + j)) * 255;
                const b = (C((freqs[2] / 255) * 2) * 90) + 165;

                x.fillStyle = R(r, g, b);
                x.fillRect(i, j, this.s, this.s);
            }
        }

    }
}
// dwitter.net/d/5734
class Dots {
    static get moduleName() {
        return "Dots";
    }

    update(t, vis, freqs) {

        let {c, x, R, i, S, C, T} = vis;

        vis.cls();

        vis.x.font = "10px Arial";
        vis.x.fillStyle = instantview.visSecondaryColor;

        const hori = ~~((vis.w / ((255 + 150) / 8)) / 2) + 2;
        const verti = ~~((vis.h / ((255 + 150) / 8)) / 2) + 2;

        for(let s = hori; s--;) {
            for(let a = verti; a--;) {
                x.beginPath();

                const ax = s*100+50;
                const ay = a*100+50;

                x.arc(ax, ay, Math.max(freqs[s + a] / 8, 10), 0, 2*Math.PI);
                x.fill();
                x.closePath();
            }
        }
        const txt = "dwitter.net/d/5734";
        vis.x.fillText(txt, vis.w - (txt.length * 5), vis.h - 10);

    }
}
// dwitter.net/d/4816
class Travis {
    static get moduleName() {
        return "Travis";
    }

    constructor(vis, fftSize) {
        
        this.circleWidth = 20;
        this.circleHeight = 20;

        this.circleX = 385;
        this.circleY = 390;

        this.prevGreen = 0;

    }

    update(t, vis, freqs) {

        let {c, x, R, i, S, C, T} = vis;

        let avg = 0;
        let avgAmount = freqs.length < 5 ? freqs.length : 5;

        for (let i = 0; i < avgAmount; i++) {
            avg += freqs[i];
        }

        avg /= avgAmount;
        let normalAvg = Math.min(1.5 + (avg / 255) * 4, 5);

        let circleX = vis.w / 2;
        let circleY = vis.h / 2;

        vis.cls();
        x.fillStyle = "black";
        x.fillRect(0, 0, vis.w, vis.h);
        for(i = 0; i < 350; i++) {

            const r = 0 % 256;
            this.prevGreen = vis.l(this.prevGreen, (i + ((255 - freqs[3]) / 255) * 220) % 256, 0.05);
            const g = this.prevGreen;
            const b = 0 % 256;

            x.fillStyle=R(r, g, b);
            x.beginPath();
            x.arc(circleX - i/9*S(i+(t / 10))*this.circleWidth, circleY+i/9*C(i+(t / 10))*this.circleHeight, i/10,0,6.28);
            x.closePath();
            x.fill();
        }

        const txt = "dwitter.net/d/4816";
        vis.x.font = "10px Arial";
        vis.x.fillText(txt, vis.w - (txt.length * 5), vis.h - 10);

    }
}

// dwitter.net/d/1231
class Iverjo {

    static get moduleName() {
        return "Iverjo";
    }

    constructor() {
        this.lastVal = 0;

        this.font = "10px Arial";
        this.watermark = "dwitter.net/d/1231";
    }

    update(time, vis, freqs) {
        let {c, x, R, i, S, C, T} = vis;
        let t = time;

        vis.cls()

        vis.x.font = this.font;
        vis.x.strokeStyle = instantview.visSecondaryColor;
        vis.x.fillStyle = instantview.visSecondaryColor;

        const speedModifier = ((parseFloat(instantview.animationSpeed, 10) / 100) || 0.90);

        const avgAmount = 4;

        let avg = 0;
        for (let i = 0; i < avgAmount; i++) {
            avg += freqs[i];
        }
        if (avg > 0) avg /= avgAmount;
        else avg = 0;

        let val = Math.max(vis.l(this.lastVal, avg / 255, 0.1), 0.1);
        this.lastVal = val;
        vis.x.scale(val, val);

        for(let i = 9; i < 2e3; i += 4) {
            let s = 3 / (9.1 - ((t * speedModifier) + i / 99) % 9);
            x.beginPath();
            let j = i * 7 + S(i * 4 + (t * speedModifier) + 1);
            x.lineWidth = s * s;
            x.arc(vis.w / (val * 2), vis.h / (val * 2), s * 49, j, j + 0.6);
            x.stroke()
            x.closePath()
        }


        vis.x.setTransform(1, 0, 0, 1, 0, 0);
        const txt = this.watermark;
        vis.x.fillText(txt, vis.w - (txt.length * 5), vis.h - 10);

    }
}

class Analyzer {
    static get moduleName() {
        return "Analyzer";
    }

    constructor() {
        this.width = 25;
        this.spacing = 3;

        this.x = 0;
        this.y = 0;

        this.freqOffset = 0;

        this.threshold = 255;
        this.thresholdHeight = 2;
    }

    update(time, vis, freqs) {

        vis.cls();

        const barOff = (this.width + this.spacing)

        const amount = ((vis.w - this.x) / (this.width + this.spacing)) - 2;

        for (let i = 0; i < amount; i++) {

            let freq = freqs[i];

            let x = (i * barOff) + ((this.width / 2) + this.x);
            let y = vis.h - this.y;

            let w = this.width;
            let h = freqs[i + this.freqOffset];


            vis.x.font = "12px Tahoma";
            vis.x.fillStyle = instantview.visPrimaryColor;

            vis.x.fillText(freqs[i + this.freqOffset], x + (this.width / 2) - 10, (vis.h - this.threshold) - this.thresholdHeight - 10);
            vis.x.fillText(i + this.freqOffset, x + (this.width / 2) - 10, (vis.h - this.threshold) - this.thresholdHeight - 30);

            vis.x.font = "8px Tahoma";
            const txty = (vis.h - this.threshold) - this.thresholdHeight - ((i % 2 === 0) ? 50 : 60)
            vis.x.fillText(`${((44100 / 2048) * i).toFixed(0)}hz`, x + (this.width / 2) - 10, txty);



            if (freq >= this.threshold) {vis.x.fillStyle = instantview.visSecondaryColor}
            else {vis.x.fillStyle = instantview.visPrimaryColor}

            vis.x.fillRect(x, y, w, -h); // draw the bars
            vis.x.fillStyle = instantview.visSecondaryColor;
            vis.x.fillRect(x, y - this.threshold, w, this.thresholdHeight);
        }

    }
}
// https://www.dwitter.net/d/2887
class Dzozef {
    static get moduleName() {
        return "Dzozef";
    }
    constructor() {
        this.padding = 60;
        this.yOffset = 1;
        this.maxMod = 50;

        this.font = "10px Arial";
        this.watermark = "dwitter.net/d/2887";
    }
    update(time, vis, freqs) {
        vis.cls();

        const center = 22 * ((vis.w - (this.padding * 2)) / 1280);

        const slopeUp = (vis.h * 0.013);
        const slopeDown = (vis.h * 0.013);

        const rows = 30;
        const columns = 30;

        const dots = rows * columns;

        for (let i = 0; i < dots; i++) {
            const a = i % rows;
            const y = Math.floor(i / rows);

            const xPos = a * center + y * center;
            const yPos = ((vis.h / 2) + 15) - a * slopeDown + y * slopeUp - this.yOffset * 16;

            let width = 4;
            let height = 4;

            const freqMod = (freqs[i] / 255) * this.maxMod;


            vis.x.fillStyle = instantview.visPrimaryColor;
            vis.x.fillRect((this.padding + xPos), yPos - freqMod, width, height);
        }

        vis.x.fillStyle = instantview.visSecondaryColor;
        vis.x.font = this.font;
        vis.x.fillText(this.watermark, vis.w - (this.watermark.length * 5), vis.h - 10);
    }
}
// https://www.dwitter.net/d/10211
class Cave {
    static get moduleName() {
        return "Cave";
    }
    constructor() {
        this.b = null;
        this.z = null;
        this.m = null;
        this.j = null;
        this.r = null;
        this.s = null;
        this.a = null;

        this.resolution = 2000;
        this.pathHeight = 8000;
        this.caveSize = 10000;
        this.cameraHeight = 6000;

        this.font = "10px Arial";
        this.watermark = "dwitter.net/d/10211";
    }
    update(time, vis, freqs) {
        let {c, x, R, i, S, C, T} = vis;
        let t = time;

        const speedModifier = ((parseFloat(instantview.animationSpeed, 10) / 100) || 0.90) * 0.5;

        vis.cls();

        for(let k = this.resolution, i = this.resolution; i--; x.fillRect(S(t * speedModifier) * this.z+(vis.w / 2)+S(this.m=this.b?(k*this.j|0)**4:0)*this.r-this.s/2,C(t * speedModifier)*this.z+(vis.h / 2)+C(this.m)*this.r,this.s,this.b?this.s:this.s/9)) {
            this.b = i % 29;
            this.z = i / 9;
            this.j = (i / k + (t * speedModifier)) % 1;
            this.r = (this.b ? this.caveSize : this.pathHeight) / this.z;
            this.s = this.cameraHeight / this.z;

            this.a = 99 + S(this.j * 9) * Math.max(60, freqs[3] / 2);

            x.fillStyle = R(this.a, this.a, 125);

        }

        vis.x.fillStyle = instantview.visSecondaryColor;
        vis.x.font = this.font;
        vis.x.fillText(this.watermark, vis.w - (this.watermark.length * 5), vis.h - 10);

    }
}
// https://www.dwitter.net/d/10202
// class Halloween {

//     static get moduleName() {
//         return "Halloween";
//     }

//     constructor() {
//         this.imgLoaded = false;
//         this.img = new Image(800, 600);
//         this.img.src = pumpkin;
//         this.img.addEventListener("load", () => {
//             this.imgLoaded = true;
//         });

//         this.lastScale = 0;
//         this.lastBrightness = 0;

//         this.avgAmount = 4;
//     }

//     update(time, vis, freqs) {
//         let {c, x, R, i, S, C, T} = vis;

//         vis.cls();
//         // background color
//         x.fillStyle = R(0, 0, 0);
//         x.fillRect(0, 0, vis.w, vis.h);
//         if (this.imgLoaded) {

//             const imgW = (vis.w / 2);
//             const imgH = (vis.h / 2);

//             let brightness = vis.l(this.lastBrightness, ((freqs[3] / 255) * 150), 0.5);
//             brightness = Math.max(50, brightness);
//             this.lastBrightness = brightness;

//             const scaling = 1;

//             // const scaling = Math.max(vis.l(this.lastScale, (brightness / 150) * 1.1, 0.30), 1);
//             // this.lastScale = scaling;

//             // x.scale(scaling, scaling);

//             // const scaleChange = scaling - 1;
//             // const offsetX = -((imgW / (2 * scaling)) * scaleChange);
//             // const offsetY = -((imgH / (2 * scaling)) * scaleChange);

//             // x.translate(offsetX, offsetY);

//             x.filter = `brightness(${brightness}%)`;
//             x.drawImage(this.img, imgW / (2 * scaling), imgH / (2 * scaling), imgW, imgH);

//         }

//     }
// }

// class Holidays {
//     static get moduleName() {
//         return "Holidays";
//     }

//     constructor() {
//         this.twopi = 2 * Math.PI;

//         this.lastMoonColor = 0;

//         this.snowflakeSize = 20;
//         this.snowflake = this.createSnowflakeOffscreen(400);
//         this.snowflakes = [];
//     }

//     update(t, vis, freqs) {
//         let {c, x, R, i, S, C, T, w, h} = vis;

//         vis.cls();

//         // fill background
//         x.fillStyle = "#001027";
//         x.fillRect(0, 0, w, h);

//         x.fillStyle = "#ffffff";
//         x.strokeStyle = "#ffffff";
//         x.lineCap = "round";

//         x.lineWidth = 5;

//         // for centering things
//         // x.fillStyle = "orange";

//         // x.fillRect(w / 2, 0, 1, h);
//         // x.fillRect(0, h / 2, w, 1);

//         this.drawBackgroundStars(x);

//         this.snowGround(x);
//         this.tree(vis, freqs[1], w / 2, h / 1.5);

//         const col = vis.l(this.lastMoonColor, freqs[3], 0.3);

//         this.moon(x, w * 0.2, h * 0.2, 35, Math.max(100, col));
//         this.lastMoonColor = col;

//         const snowSpeed = Math.max(2, (freqs[3] / 255) * 6);

//         this.snowFall(x, t, S, snowSpeed);
//     }

//     tree(vis, starFreq, startX, startY) {

//         const w = vis.x.canvas.width;
//         const h = vis.x.canvas.height;

//         const treeWidth = 350;
//         const treeHeight = 200;

//         const treeX = startX - (treeWidth / 2);
//         const treeY = startY + (treeHeight / 2);

//         const gradient = vis.x.createLinearGradient(0, h / 2, w, h / 2);
//         gradient.addColorStop(0, "#34A65F");
//         gradient.addColorStop(0.5, "#34A65F");
//         gradient.addColorStop(0.5, "#0F8A5F");
//         gradient.addColorStop(1, "#0F8A5F");

//         vis.x.fillStyle = gradient;

//         const baseWidth = treeWidth * 0.1375;
//         const baseHeight = treeHeight * 0.25;

//         vis.x.fillStyle = "#5e3a12";

//         vis.x.beginPath();
//         vis.x.strokeStyle = "black";
//         vis.x.rect(startX - (baseWidth / 2), startY + baseHeight * 2 - 5, baseWidth, baseHeight);
//         vis.x.fill();
//         vis.x.stroke();

//         vis.x.closePath();

//         vis.x.fillStyle = gradient;

//         this.treePart(vis.x, treeX, treeY, treeWidth, treeHeight, treeWidth / 4);
//         this.treePart(vis.x, treeX + (treeWidth * 0.165), treeY - treeHeight + 60, treeWidth / 1.5, treeHeight / 1.5, treeWidth / 6);
//         this.treePart(vis.x, treeX + (treeWidth * 0.25), treeY - treeHeight - 30, treeWidth / 2, treeHeight / 2, 0);

//         const starSize = 0.25;
//         const starWidth = 216 * starSize;
//         const starHeight = 216 * starSize;

//         this.star(vis, starFreq, w / 2 - (starWidth / 2), treeY - treeHeight - 180, starSize);
//     }

//     treePart(x, startX, startY, width, height, topWidth = 0) {
//         x.beginPath();
//         x.moveTo(startX, startY);

//         x.lineTo(startX + width, startY);
//         x.lineTo((startX + (width / 2)) + (topWidth / 2), startY - height);
//         x.lineTo((startX + (width / 2)) - (topWidth / 2), startY - height);

//         x.closePath();
//         x.fill();
//         x.stroke();
//     }

//     drawBackgroundStars(x) {

//     }

//     star(vis, freq, startX, startY, size = 1) {
//         const nextColor = vis.lc(0x7c7c19, 0xffff33, freq / 255);

//         vis.x.fillStyle = "#" + nextColor.toString(16)

//         vis.x.beginPath();
//         vis.x.moveTo(startX + (size * 108), startY + (size * 0.0));
//         vis.x.lineTo(startX + (size * 141), startY + (size * 70));
//         vis.x.lineTo(startX + (size * 218), startY + (size * 78.3));
//         vis.x.lineTo(startX + (size * 162), startY + (size * 131));
//         vis.x.lineTo(startX + (size * 175), startY + (size * 205));
//         vis.x.lineTo(startX + (size * 108), startY + (size * 170));
//         vis.x.lineTo(startX + (size * 41.2), startY + (size * 205));
//         vis.x.lineTo(startX + (size * 55), startY + (size * 131));
//         vis.x.lineTo(startX + (size * 1), startY + (size * 78));
//         vis.x.lineTo(startX + (size * 75), startY + (size * 68));
//         vis.x.lineTo(startX + (size * 108), startY + (size * 0));
//         vis.x.closePath();
//         vis.x.fill();
//     }

//     moon(x, startX, startY, radius, colorComponent) {
//         x.fillStyle = "#FFC0CB10";
//         x.beginPath();
//         x.arc(startX, startY, radius + (radius * 0.4), 0, this.twopi);
//         x.closePath();
//         x.fill();

//         x.fillStyle = "#FFC0CB09";
//         x.beginPath();
//         x.arc(startX, startY, radius + (radius * 0.15), 0, this.twopi);
//         x.closePath();
//         x.fill();

//         x.fillStyle = `rgb(${colorComponent}, ${colorComponent}, ${colorComponent})`;
//         x.beginPath();
//         x.arc(startX, startY, radius, 0, this.twopi);
//         x.closePath();
//         x.fill();
//     }

//     snowGround(x) {
//         x.fillStyle = "snow"
//         x.fillRect(0, x.canvas.height / 1.3, x.canvas.width, x.canvas.height);
//     }

//     snowFall(x, t, S, speed) {

//         x.fillStyle = "white";

//         const lifeTime = 0.127;

//         // console.log(this.snowflakes.length);

//         this.snowflakes = this.snowflakes.slice(-20);
//         if(t % lifeTime < 0.01) {
//             const flakeX = t % 1 * 2e3;
//             const flakeY = -40;
//             this.snowflakes.push([flakeX, flakeY]);
//         }
//         x.font="40px A";
//         for(let e of this.snowflakes) {
//             const flakeX = e[0] + S(t + e[0]) * 90;
//             const flakeY = e[1] += speed;
//             // x.fillText("❄", flakeX, flakeY);
//             x.drawImage(this.snowflake.canvas, flakeX, flakeY, this.snowflakeSize, this.snowflakeSize);
//         }
//     }

//     drawSnowflake(x, startX, startY, size) {
//         // this.flakePart(x, startX, startY, size);
//         x.translate(x.canvas.width / 2, x.canvas.height / 2);
//         this.flakePart(x, 0, -size / 2, size);
//         x.rotate(1.05);
//         this.flakePart(x, 0, -size / 2, size);
//         x.rotate(1.05);
//         this.flakePart(x, 0, -size / 2, size);
//         x.translate(-(x.canvas.width / 2), -(x.canvas.height / 2));
//         // this.flakePart(x, startX, startY, size);
//     }
//     flakePart(x, startX, startY, size) {
//         x.beginPath();

//         x.moveTo(startX, startY);
//         x.lineTo(startX, startY + size);

//         x.moveTo(startX + 50, startY + 40);
//         x.lineTo(startX, startY + 70);
//         x.lineTo(startX - 50, startY + 40);

//         x.moveTo(startX + 50, startY + size - 40);
//         x.lineTo(startX, startY + size - 70);
//         x.lineTo(startX - 50, startY + size - 40);

//         // x.closePath();

//         x.stroke();
//     }

//     createSnowflakeOffscreen(size, lineWidth = 20) {
//         const snowflake = this.createOffscreenCanvas(size, size + 20);
//         snowflake.strokeStyle = "#ffffff";

//         snowflake.lineCap = "round";
//         snowflake.lineWidth = lineWidth;

//         this.drawSnowflake(snowflake, 0, 0, size);
//         return snowflake;
//     }

//     createOffscreenCanvas(width, height) {
//         const canv = document.createElement("canvas");
//         canv.width = width;
//         canv.height = height;
//         return canv.getContext("2d");
//     }
// }

export { VerticalBars, Cave, Dots, Iverjo, Plaid, Quadratics, CircularBars, Travis, Analyzer, Dzozef };

