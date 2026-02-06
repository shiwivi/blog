/*
 * @Author: SHIWIVI
 * @Date: 2023-10-16 03:11
 * @Last Modified by: SHIWIVI
 * @Last Modified time: 2024-06-07 15:58:35
 */
const { PI, cos, sin, tan, abs, sqrt, pow, min, max, ceil, floor, round, random, atan2 } = Math;
const getRandom = (min, max) => random() * (max - min) + min;
const canvasPage = document.createElement("canvas");
const ctxPage = canvasPage.getContext("2d");
let webTheme = window.localStorage.getItem("webTheme") || "light";
let pageWidth, pageHeight;
let pointerAni = [];
let sparkArray = [];
Float32Array.prototype.get = function (i = 0, l = 0) {
    let t = i + l;
    let result = [];
    for (; i < t; i++) {
        result.push(this[i])
    }
    return result;
};
class Ball {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.dx = getRandom(-6, 6);
        this.dy = 1;
        this.r = r;
    }
    update() {
        if (this.r <= 5) {
            pointerAni.shift();
            return;
        }
        let xLeft = this.x + this.dx - this.r;
        let xRight = this.x + this.dx + this.r;
        let yBottom = this.y + this.dx + this.r;
        if (yBottom > pageHeight - 10) {
            this.dy = -this.dy;
            this.dy *= .7;
            this.dx *= 1;
            this.r -= 5;
            this.y += this.dy - 10;
            sparkArray.push(new Spark(this.x, this.y, 4, 4, 5, 50, true));
        }
        else {
            this.dy += 0.5;
            this.y += this.dy;
        }
        if (xLeft < 0 || xRight > pageWidth) {
            this.dx = -this.dx;
        }
        this.y += this.dy;
        this.x += this.dx;
        this.draw();
    }
    draw() {
        ctxPage.save();
        ctxPage.beginPath();
        ctxPage.arc(this.x, this.y, this.r + 30, 0, PI * 2);
        const gradient = ctxPage.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        gradient.addColorStop(0, "#ffffffda");
        gradient.addColorStop(0.3, "#ffffffda");
        gradient.addColorStop(0.4, "#ffffff40");
        gradient.addColorStop(1, "#fff0");
        ctxPage.fillStyle = gradient;
        ctxPage.fill();
        ctxPage.closePath();
        ctxPage.restore();
    }
}
class Spark {
    constructor(x, y, width = 5, height = 5, sugarNum = 9, live = 140, spark = false) {
        this.x = x,
            this.y = y,
            this.height = height,
            this.width = width,
            this.sugarNum = sugarNum,
            this.live = live,
            this.colors = ["#f00", "#f80", "#fffb00", "#2bff00", "#0fd", "#2002ff", "#cc02ff", "#ff02bc", "#1b9cfc", "#25ccf7", "#fff"];
        this.data = new Float32Array(6 * sugarNum); //存储的参数有x,y,dx,dy,yBottom,colorIndex
        spark ? this.setSpark() : this.setSugar();
    }
    setSpark() {
        for (let i = 0; i < this.sugarNum; i++) {
            let dy = random() * (-10) - 2;
            this.data.set([this.x, this.y, random() * 9 - 3, dy, this.y + dy + this.height, this.colors.length - 1], i * 6)
        }
    }
    setSugar() {
        for (let i = 0; i < this.sugarNum; i++) {
            let dy = random() * 10 - 5;
            this.data.set([this.x, this.y, random() * 6 - 3, dy, this.y + dy + this.height, i > this.colors.length - 1 ? round(random() * this.colors.length - 2) : i], i * 6)
        }
    }
    update() {
        if (this.live < 0) {
            sparkArray.shift();
            return;
        }

        for (let i = 0; i < this.sugarNum; i++) {
            let [x, y, dx, dy, yBottom, colorIndex] = this.data.get(6 * i, 6);
            if (yBottom >= pageHeight) {
                dy = -dy;
                dy *= 0.5;
                y += dy - 10;
            }
            else {
                dy += .5;
                y += dy;
            }
            x += dx;
            yBottom = y + this.height;
            this.data.set([x, y, dx, dy, yBottom], i * 6)
            this.draw(x, y, this.colors[colorIndex]);
        }
        this.live--;
    }
    draw(x, y, color) {
        ctxPage.beginPath();
        ctxPage.fillStyle = color;
        ctxPage.fillRect(x, y, this.width, this.height);
        ctxPage.closePath();
    }
}

function canvasInit() {
    pageWidth = canvasPage.width = window.visualViewport.width || document.documentElement.clientWidth;
    pageHeight = canvasPage.height = window.visualViewport.height || document.documentElement.clientHeight;//pageCanvas用于全屏点击特效
    canvasPage.style = "position:fixed;top:0;left:0;z-index:200;pointer-events:none;";
    document.body.append(canvasPage);
}
function canvasResize() {
    pageWidth = canvasPage.width = window.visualViewport.width || document.documentElement.clientWidth;
    pageHeight = canvasPage.height = window.visualViewport.height || document.documentElement.clientHeight;
}
function canvasThrottle(func, time) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func();
        }, time)
    }
}

window.addEventListener("resize", canvasThrottle(canvasResize, 500));
let clickAnimation = webTheme === "dark" ? function (e) { e.stopPropagation(); pointerAni.push(new Ball(e.clientX, e.clientY, 20)) } : function (e) { e.stopPropagation(); sparkArray.push(new Spark(e.clientX, e.clientY, 5, 5, 10, 140, false)); }

window.addEventListener("click", clickAnimation)
function canvasAnimation() {
    ctxPage.clearRect(0, 0, pageWidth, pageHeight);
    pointerAni.forEach(p => p.update());
    sparkArray.forEach(s => s.update());
    window.requestAnimationFrame(canvasAnimation)
}
canvasInit();
canvasAnimation();