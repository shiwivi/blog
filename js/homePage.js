/*
 * @Author: SHIWIVI 
 * @Date: 2023-09-07 00:29:00 
 * @Last Modified by: SHIWIVI
 * @Last Modified time: 2024-06-07 15:58:35
 */
//线性插值
const lerp = (a, b, amt) => (1 - amt) * a + amt * b;
Array.prototype.lerp = function (t = [], a = 0) {
  this.forEach((n, i) => (this[i] = lerp(n, t[i], a)));
};
//存储canvas数据
class PropsArray {
  constructor(count = 0, props = []) {
    this.count = count;
    this.props = props;
    this.values = new Float32Array(count * props.length);
  }
  get length() {
    return this.values.length;
  }
  set(a = [], i = 0) {
    this.values.set(a, i);
  }
  get(i = 0) {
    return this.values.get(i, this.props.length);
  }
}
const angle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const fadeInOut = (t, m) => {
  let hm = 0.5 * m;
  return Math.abs((t + hm) % m - hm) / hm;
};

//图片懒加载
const viewH = document.documentElement.clientHeight;
if (document.querySelector(".update")) {
  let pics = document.querySelectorAll(".update-pic");
  function loadPic(picIndex) {
    let img = pics[picIndex].querySelector("img");
    img.src = img.dataset.src;
    img.onload = function () {
      setTimeout(() => {
        this.parentNode.previousElementSibling.style = "display:none;";
        this.parentNode.style = "visibility:visible;";
      }, 1000)
    }
  }

  function lazyloadThrottle() {
    let picIndex = 2;
    let standby = true;
    return function () {
      if (standby) {
        standby = false;
        if (picIndex >= pics.length) {
          main.removeEventListener("scroll", lazyloadThrottle);
          return;
        }
        if (pics[picIndex].getBoundingClientRect().top < viewH) {
          loadPic(picIndex);
          picIndex++;
        }
        setTimeout(() => standby = true, 300)
      }
    }
  }

  for (let i = 0; i < Math.min(2, pics.length); i++) {
    loadPic(i);
  }
  main.addEventListener("scroll", lazyloadThrottle());
  //文章聚焦
  let lis = document.querySelector(".update").querySelectorAll("li");
  function articleFocus() {
    let standby = true;
    return function () {
      if (standby) {
        standby = false;
        lis.forEach(item => {
          let rect = item.getBoundingClientRect();
          if (rect.top < 350 && rect.top > 80) {
            item.classList.add("focus")
          }
          else {
            item.classList.remove("focus")
          }
        });
        setTimeout(() => standby = true, 300);//节流
      }
    }
  }

  main.addEventListener("scroll", articleFocus());
  //鼠标经过时，将焦点转换到目标身上
  lis.forEach(item => {
    item.onmouseover = function () {
      lis.forEach(allItem => {
        allItem.classList.remove("focus");
      })
      item.classList.add("focus");
    }
    item.onmouseout = function () {
      item.classList.remove("focus");
    }
  });
}

console.log(`
┬┬  ┌┬┐┬  ┌─┐┬ ┬┬┬ ┬┬
││   │││  └─┐├─┤│││││
┴┴  ─┴┘┴  └─┘┴ ┴┴└┴┘┴
  shiwivi.com`);


//网站运行时间
if (document.getElementById("day")) {
  const currentYear = document.querySelector(".current-year");
  currentYear.textContent = new Date().getFullYear();
  let timeGap = floor((new Date().getTime() - new Date("2021/4/10 12:19:14")) / 1000);
  const dayWrapper = document.getElementById("day");
  const hourWrapper = document.getElementById("hour");
  const minuteWrapper = document.getElementById("minute");
  const second = document.getElementById("second");
  setInterval(() => {
    let seconds = timeGap % 60;
    dayWrapper.textContent = floor(timeGap / 86400);
    hourWrapper.textContent = floor(timeGap / 3600 % 24);
    minuteWrapper.textContent = floor(timeGap / 60 % 60);
    second.textContent = seconds > 9 ? seconds : "0" + seconds;
    timeGap += 1;
  }, 1000)
}



/**
*==== canvas引擎 =====
*  创建Canvas动画引擎
* @param {HTMLCanvasElement} canvas - Canvas元素
* @param {boolean} [highRes=false] - 是否创建高分辨率画布
*
*
*=====================*/
class CanvasEngine {
  constructor(canvas, highRes = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.highRes = highRes;
    //渲染场景
    this.scene = null;
    //动画引擎状态
    this.running = false;//是否正在运行
    this.isSuspended = false;//是否因为特殊原因(如resize)暂停
    this.animationID = null;//AnimationFrameID
    //canvas信息，为动画类提供参数
    this.renderContext = {
      ctx: this.ctx,
      bufferCtx: null,
      status: {
        isSuspended: this.isSuspended
      },
      viewport: {
        dpr: 1,
        width: 300,
        height: 150,
        centerX: 150,
        centerY: 75,
      }
    };
    if (!this.highRes) {
      this._setBufferCanvas();
    }
    //设置寸尺信息
    this._resize();
    this.resizeHandler = this._debounce(this._resize, 800);
    window.addEventListener("resize", this.resizeHandler);
    this._setLoop();
  };
  //离屏canvas
  _setBufferCanvas() {
    this.bufferCanvas = document.createElement("canvas");
    this.bufferCtx = this.bufferCanvas.getContext("2d");
    this.renderContext.bufferCtx = this.bufferCtx;
  }
  _debounce(fn, delay = 300) {
    let timer = null;
    return (...args) => {
      this.isSuspended = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args)
        this.isSuspended = false;
      }, delay)
    }
  }
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const vv = window.visualViewport;
    //css像素
    const cssWidth = vv ? vv.width : document.documentElement.clientWidth;
    const cssHeight = vv ? vv.height : document.documentElement.clientHeight;
    //物理像素
    const physicalWidth = cssWidth * dpr;
    const physicalHeight = cssHeight * dpr;
    //CSS
    this.canvas.style.width = cssWidth + "px";
    this.canvas.style.height = cssHeight + "px";
    //当前使用的坐标系
    const renderWidth = this.highRes ? physicalWidth : cssWidth;
    const renderHeight = this.highRes ? physicalHeight : cssHeight;
    //更新canvas的信息
    const vp = this.renderContext.viewport;
    vp.dpr = dpr;
    vp.width = renderWidth;
    vp.height = renderHeight;
    vp.centerX = renderWidth / 2;
    vp.centerY = renderHeight / 2;
    //修改画布寸尺
    this.canvas.width = renderWidth;
    this.canvas.height = renderHeight;
    if (!this.highRes) {
      this.bufferCanvas.width = renderWidth;
      this.bufferCanvas.height = renderHeight;
    }
  }
  setScene(scene) {
    this.scene = scene;
  }
  start() {
    if (this.running) return;
    this.animationID = requestAnimationFrame(this._loop)
    this.running = true;
  }
  stop() {
    if (!this.running) return
    this.running = false;
    if (this.animationID) cancelAnimationFrame(this.animationID);
    this.scene = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  //未启用
  boom() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }
  _setLoop() {
    const renderGlow = () => {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.filter = "blur(8px) brightness(200%)";
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
      this.ctx.filter = "blur(4px) brightness(200%)";
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
      this.ctx.filter = "none";
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
      this.ctx.restore();
    }
    this._loop = this.highRes ?
      () => {
        if (!this.running) return;
        if (this.isSuspended) {
          if (this.scene) {
            this.scene.handleCanvasChange()
          }
          this.animationID = requestAnimationFrame(this._loop)
          return;
        }
        this.scene.update();
        this.animationID = requestAnimationFrame(this._loop)
      } :
      () => {
        if (!this.running) return;
        if (this.isSuspended) {
          if (this.scene) {
            this.scene.handleCanvasChange()
          }
          this.animationID = requestAnimationFrame(this._loop)
          return;
        }
        this.scene.update();
        renderGlow();
        this.animationID = requestAnimationFrame(this._loop)
      };
  }
}

/*
*==== 动画类 =====
* 
*/
class AnimationUnit {
  constructor(renderContext) {
    this.ctx = renderContext.ctx;
    this.status = renderContext.status;
    this.viewport = renderContext.viewport;
  }
  handleCanvasChange() {
    this.update()
  }
  update() { }// 更新
  onExit() { }//释放资源    
}
/*========万花筒动画======
 * 螺旋曲线
 * x = r * Math.cos(angle + phi);
 * y = r * Math.sin(angle + phi);
 * 
*/
class Kaleidoscope extends AnimationUnit {
  constructor(renderContext) {
    super(renderContext);
    this.angle = 0;//角度
    this.angleStep = 0;//角度旋转增量
    this.hue = 0;//色相
    this.rStep = 2 * (this.viewport.dpr || 1);
  }
  update() {
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    this.ctx.beginPath();
    let g = this.ctx.createLinearGradient(this.viewport.centerX + 300, this.viewport.centerY + 300, this.viewport.centerX - 300, this.viewport.centerY - 300);
    g.addColorStop(0, `hsla(${this.hue % 360},100%,50%,1)`);
    g.addColorStop(0.8, `hsla(${(this.hue + 180) % 360},100%,50%,1)`);
    g.addColorStop(1, `hsla(0,100%,50%,1)`);
    this.ctx.strokeStyle = g;

    let r = 0;
    for (let i = 100; i > 0; i--) {
      r += this.rStep;
      this.angle = i * this.angleStep;
      const x = r * cos(this.angle);
      const y = r * sin(this.angle);
      this.ctx.lineTo(this.viewport.centerX + x, this.viewport.centerY + y);
      this.angleStep += .00001;
    }
    this.ctx.stroke();
    this.ctx.closePath();
    this.hue++;
  }
}
/*=======藤蔓动画======
 *
 * 
 * 
 * 
*/
const vinePresets = {
  PC: {
    mainVineMaxY: 0.4,
    mainVinefrequency: 0.01,
    mainVineAmplitude: 50,
    branchVinefrequency: 0.01 + random() * 0.0025,
    branchVineAmplitude: 105,
    branchVineGrowX: getRandom(0.5, 1.5),
    branchVine1MaxY: 0.3,
    branchVine2MaxY: 0.3 + random() * 0.2,
    flowerScale: 9,
    tendrilScale: 60,
  },
  mobile: {
    mainVineMaxY: 0.3,
    mainVinefrequency: 0.005,
    mainVineAmplitude: 50,
    branchVinefrequency: 0.0055,
    branchVineAmplitude: 200,
    branchVineGrowX: 0.25,
    branchVine1MaxY: 0.4,
    branchVine2MaxY: 0.6,
    flowerScale: 25,
    tendrilScale: 100,
  }
}

const vineConfig = mobile ? vinePresets.mobile : vinePresets.PC;

//藤蔓父类
class Vine {
  constructor(ctx, viewport, setTendril, setFlower, setTwig) {
    this.viewport = viewport;
    //动画绘制位置
    this.rootX = viewport.centerX;//屏幕中心
    this.rootY = viewport.height;//屏幕底部
    //动画更新坐标
    this.x = viewport.centerX;
    this.y = viewport.height;
    //canvas相关
    this.ctx = ctx;
    this.lineWidth = 4;
    //绘制最大值
    this.maxY = 0;
    //卷须
    this.tendrilIndex = 0;
    this.tendrilArray = this.getPosition(2, this.maxY + 400, this.viewport.height * .9);
    this.setTendril = setTendril;
    //花朵
    this.bloom = false;
    this.setFlower = setFlower;
    //枝干
    this.twigArray = this.getPosition(1, this.maxY + 400, this.viewport.height - 100)
    this.setTwig = setTwig;
  }
  getPosition(num, min, max) {
    const array = []
    for (let i = 0; i < num; i++) {
      array.push(min + random() * (max - min))
    }
    return array.sort((a, b) => b - a);
  }
  updateX() {
    throw new Error('子类未重写update');
  }
  update() {
    if (this.bloom) {
      return;
    }
    if (this.y < this.maxY) {
      this.bloom = true;
      this.setFlower(this.ctx, this.x, this.y)
      return;
    }
    if (this.x < 100 || this.x > this.viewport.width - 100) {
      this.bloom = true;
      this.setFlower(this.ctx, this.x, this.y)
      return;
    }
    this.prevX = this.x;
    this.prevY = this.y;
    this.y -= 5;
    this.updateX()
    this.draw();
    if (this.y < this.twigArray[0]) {
      this.setTwig(this.ctx, this.viewport, this.x, this.y,
        this.setFlower, this.direction);
      this.twigArray.shift();
    }
    const nextTendril = this.tendrilArray[0];
    if (this.y < nextTendril) {
      this.tendrilArray.shift()
      const direction = this.tendrilIndex % 2 == 0 ? -1 : 1;
      this.tendrilIndex++;
      this.setTendril(this.ctx, this.prevX, this.prevY, this.x, this.y, direction)
    }
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = '#fffc';
    this.ctx.moveTo(this.prevX, this.prevY);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
//主藤蔓通过正弦函数绘制
class MainVine extends Vine {
  constructor(ctx, viewport, setTendril, setFlower, setTwig) {
    super(ctx, viewport, setTendril, setFlower, setTwig);
    this.frequency = vineConfig.mainVinefrequency;//频率
    this.amplitude = vineConfig.mainVineAmplitude;//幅度
    this.dx = sin(this.frequency * this.rootY) * this.amplitude;//将图像移到rootX的差值
    this.maxY = this.viewport.height * vineConfig.mainVineMaxY;//藤蔓生长最大值,值越小藤蔓越长
  }
  updateX() {
    this.x = this.rootX + sin(this.frequency * this.y) * this.amplitude - this.dx;
  }
}
//侧藤蔓，正弦函数与斜率
class BranchVine extends Vine {
  constructor(ctx, viewport, setTendril, setFlower, setTwig, direction, maxYFactor) {
    super(ctx, viewport, setTendril, setFlower, setTwig);
    this.direction = direction;
    this.frequency = vineConfig.branchVinefrequency;//频率
    this.amplitude = vineConfig.branchVineAmplitude;//幅度
    this.growX = vineConfig.branchVineGrowX;//偏移值
    this.wait = 10 + random() * 50;//延时生长
    this.maxY = viewport.height * maxYFactor;//最大值,值越小藤蔓越长
    this.initX = this.direction * sin(this.frequency * this.y) * this.amplitude + this.direction * this.growX * this.y;
    this.dx = this.rootX - this.initX;//将图像移到rootX的差值
  }
  updateX() {
    this.x = this.direction * sin(this.frequency * this.y) * this.amplitude + this.direction * this.growX * this.y + this.dx;
  }
}
//枝蔓
class Twig {
  constructor(ctx, viewport, rootX, rootY, setFlower, direction = 1) {
    this.ctx = ctx;
    this.viewport = viewport;
    this.rootX = rootX;
    this.rootY = rootY;
    this.prevX = rootX;
    this.prevY = rootY;
    this.x = rootX;
    this.y = rootY;
    this.direction = direction;
    this.frequency = this.getRandom(0.02, 0.03);//频率
    this.amplitude = 100;//幅度
    this.wait = 50 + random() * 200;
    this.bloom = false;
    this.setFlower = setFlower;
    this.lineWidth = 3;
    this.ax = this.getRandom(1, 4);
    this.maxY = this.getRandom(80, 160);
    this.length = rootY - this.maxY;
    //初始坐标
    this.initX = this.direction * sin(this.frequency * this.rootY) * this.amplitude + this.direction * this.ax * this.rootY;
    this.dx = rootX - this.initX;
  }
  getRandom(min, max) {
    return min + random() * (max - min)
  }
  update() {
    if (this.bloom) {
      return;
    }
    if (this.wait > 0) {
      this.wait--;
      return
    }
    if (this.x < 100 || this.x > this.viewport.width - 100) {
      this.setFlower(this.ctx, this.x, this.y);
      this.bloom = true;
      return;
    }
    if (this.y < this.length) {
      this.setFlower(this.ctx, this.x, this.y);
      this.bloom = true;
      return;
    }
    this.prevX = this.x;
    this.prevY = this.y;
    this.y -= 5;
    this.x = this.direction * sin(this.frequency * this.y) * this.amplitude + this.direction * this.ax * this.y + this.dx;
    this.lineWidth -= 0.02
    this.draw();

  }
  draw() {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = '#fff';
    this.ctx.moveTo(this.prevX, this.prevY);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

}
//卷须
//对数螺旋曲线 r(θ)=a⋅e^(bθ)
class Tendril {
  constructor(ctx, x1, y1, x2, y2, direction) {
    this.a = vineConfig.tendrilScale + random() * 70;//初始半径
    this.b = -0.3;//收缩速度
    this.ctx = ctx;
    this.prevX = x2;
    this.prevY = y2;
    this.direction = direction;//方向
    this.maxAngle = 4 * PI;//最大角度,即绘制圈数
    this.lineWidth = 3;
    this.strokeStyle = '#fff';
    this.wait = 100 + random() * 300;
    //计算初始角度
    const lineAngle = atan2(y1 - y2, x1 - x2);
    this.theta = this.direction * (-PI / 2 + lineAngle);
    //计算坐标差值
    const radius = this.a * exp(this.b * this.theta);
    const initX = this.direction * (this.a - radius * cos(this.theta));
    const initY = -radius * sin(this.theta);
    this.dx = x2 - initX;
    this.dy = y2 - initY;
  }
  update() {
    if (this.theta > this.maxAngle) {
      return;
    }
    if (this.wait > 0) {
      this.wait--;
      return
    }
    this.theta += 0.08
    const radius = this.a * exp(this.b * this.theta);
    this.x = this.dx + this.direction * (this.a - radius * cos(this.theta));
    this.y = this.dy - radius * sin(this.theta);
    this.lineWidth -= 0.01;
    this.draw();
    this.prevX = this.x;
    this.prevY = this.y;
  }
  draw() {
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.moveTo(this.prevX, this.prevY)
    this.ctx.lineTo(this.x, this.y)
    this.ctx.stroke()
    this.ctx.closePath()
  }
}

//蝴蝶曲线
//方程 r = e^cosθ - 2cos(kθ) + sin(θ/12)^5
class Flower {
  constructor(ctx, centerX, centerY) {
    this.ctx = ctx;
    this.centerX = centerX;
    this.centerY = centerY;
    this.theta = 0;//当前绘制角度
    this.frequency = this.getfrequency();//频率k值
    this.maxTheta = this.frequency > 6 ? 5 * PI : 8 * PI;//最大绘制角度
    this.scale = vineConfig.flowerScale + random() * 10;//幅度值缩放
    this.prevX = centerX;
    this.prevY = centerY;
    this.x = centerX;
    this.y = centerY;
    this.style = this.getCtxStrokeStyle()
    this.lineWidth = this.frequency > 8 ? 2 : 3;
  }

  getfrequency() {
    const f = [3.5, 4.8, 5.0, 5.5, 6.7, 7.5, 8.8, 9.5]
    return f[Math.floor(random() * f.length)];
  }
  /*
  * 花朵颜色
  *
  */
  getCtxStrokeStyle() {
    const cores = [
      '#FFD7A3', // 橙花瓣 → 黄花蕊
      '#4b7ef6', // 蓝花瓣 → 白花蕊
      '#FFE0EB', // 粉花瓣 → 淡白花蕊
      '#faa1a8', // 红花瓣 → 淡红花蕊
      '#FFF0F5', // 浅粉花瓣 → 粉白花蕊
      '#81dff4' //  蓝花瓣 → 翠绿花蕊
    ];
    const colors = [
      '#f6773c',
      '#ffffff',
      '#FF6B9D',
      '#E63946',
      '#FF85A1',
      '#4b7ef6'];
    const colorIndex = floor(random() * colors.length)
    const color = colors[colorIndex];
    const core = cores[colorIndex];
    const style = this.ctx.createRadialGradient(this.centerX, this.centerY, this.scale * 0.2, this.centerX + this.scale * 0.4, this.centerY, this.scale * 2);
    style.addColorStop(0, core);
    style.addColorStop(1, color);
    return style;
  }

  update() {
    if (this.theta > this.maxTheta) {
      return
    }
    this.prevX = this.x;
    this.prevY = this.y;
    const r = exp(cos(this.theta)) - 2 * cos(this.frequency * this.theta) + pow(sin(this.theta / 12), 5);
    // 极坐标转直角坐标
    this.x = this.centerX + r * cos(this.theta) * this.scale;
    this.y = this.centerY + r * sin(this.theta) * this.scale;
    this.theta += 0.06
    this.draw(this.x, this.y)
  }
  draw(x, y) {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.style;
    this.ctx.lineTo(this.prevX, this.prevY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
//藤蔓动画管理
class VineManger extends AnimationUnit {
  constructor(renderContext) {
    super(renderContext);
    this.needsReset = false;
    this._reset();
  }
  _reset() {
    this.tendrils = [];//卷须
    this.flowers = [];//花
    this.twigs = [];//存储侧枝  
    const setTendril = (ctx, x1, y1, x2, y2, direction) => {
      this.tendrils.push(new Tendril(ctx, x1, y1, x2, y2, direction))
    };
    const setFlower = (ctx, x, y) => {
      this.flowers.push(new Flower(ctx, x, y))
    };
    const setTwig = (ctx, viewport, x, y, fn, direction) => {
      this.twigs.push(new Twig(ctx, viewport, x, y, fn, direction))
    };
    this.mainVine = new MainVine(this.ctx, this.viewport, setTendril, setFlower, setTwig);
    this.branchVine1 = new BranchVine(this.ctx, this.viewport, setTendril, setFlower, setTwig, -1, vineConfig.branchVine1MaxY);
    this.branchVine2 = new BranchVine(this.ctx, this.viewport, setTendril, setFlower, setTwig, 1, vineConfig.branchVine2MaxY);
    this.needsReset = false;
  }
  handleCanvasChange() {
    this.needsReset = true;
  }
  update() {
    if (this.needsReset) {
      this._reset();
      return
    }
    this.mainVine.update();
    this.branchVine1.update();
    this.branchVine2.update();
    this.flowers.forEach(e => e.update())
    this.tendrils.forEach(e => e.update())
    this.twigs.forEach(e => e.update())
  }
}
/**
 *  拟态触手动画
 * 
 * 
*/
//动画预设值
const tentaclePresets = {
  PC: {
    tentacleCount: 30,
    segmentCountMin: 10,
    segmentCountMax: 20,
    segmentLengthMin: 20,
    segmentLengthMax: 40,
    colonyRadius: 200,
  },
  mobile: {
    tentacleCount: 20,
    segmentCountMin: 8,
    segmentCountMax: 15,
    segmentLengthMin: 20,
    segmentLengthMax: 30,
    colonyRadius: 100,
  }
}

const tentacleConfig = mobile ? tentaclePresets.mobile : tentaclePresets.PC;

class Tentacle {
  constructor(ctx, x, y, segmentNum, baseLength, baseDirection, baseColor) {
    this.ctx = ctx;
    this.base = [x, y];
    this.position = [x, y];
    this.target = [x, y];
    this.simplex = new SimplexNoise();
    this.segmentNum = segmentNum;
    this.baseLength = baseLength;
    this.baseDirection = baseDirection;
    this.segmentProps = ["x1", "y1", "x2", "y2", "l", "d", "h"];
    this.segments = new PropsArray(segmentNum, this.segmentProps);
    this.follow = false;
    let i = this.segments.length - this.segmentProps.length;
    let x1, y1, x2, y2, l, d, h;

    l = this.baseLength;
    d = this.baseDirection;

    for (; i >= 0; i -= this.segmentProps.length) {
      x1 = x2 || this.position[0];
      y1 = y2 || this.position[1];
      x2 = x1 - l * cos(d);
      y2 = y1 - l * sin(d);
      d += 0.3;
      l *= 0.98;
      h = baseColor + i / this.segments.length * 180;
      this.segments.set([x1, y1, x2, y2, l, d, h], i);
    }
  }
  setTarget(target) {
    this.target = target;
  }
  //未下达click指令时的数据更新
  updateBase(tick) {
    let t = this.simplex.noise3D(this.base[0] * .005, this.base[1] * 0.005, tick * .005) * 2 * PI;
    this.base.lerp([
      this.base[0] + 20 * cos(t),
      this.base[1] + 20 * sin(t)],
      .025);
  }
  //更新数据
  update(tick) {

    let target = this.position;
    let i = this.segments.length - this.segmentProps.length;

    this.position.lerp(this.target, .015);

    !this.follow && this.updateBase(tick);


    for (; i >= 0; i -= this.segmentProps.length) {
      let [x1, y1, x2, y2, l, d, h] = this.segments.get(i);
      let t, n, tn;

      x1 = target[0];
      y1 = target[1];
      t = angle(x1, y1, x2, y2);
      n = this.simplex.noise3D(
        x1 * 0.005,
        y1 * 0.005,
        (i + tick) * 0.005);
      tn = t + n * PI * 0.0125;
      x2 = x1 + l * cos(tn);
      y2 = y1 + l * sin(tn);
      d = t;
      target = [x2, y2];
      this.segments.set([x1, y1, x2, y2, l, d], i);
      this.drawSegment(x1, y1, x2, y2, h, n, i);
    }
  }
  //绘制
  drawSegment(x1, y1, x2, y2, h, n, i) {
    const fn = fadeInOut(1 + n, 2);
    const fa = fadeInOut(i, this.segments.length);
    const a = 0.25 * (fn + fa);
    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a})`;
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a + 0.5})`;
    this.ctx.arc(x1, y1, fn * 3, 0, 2 * PI);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

class TentacleManger extends AnimationUnit {
  constructor(renderContext) {
    super(renderContext);
    this.ctx = renderContext.ctx;
    this.bufferCtx = renderContext.bufferCtx;
    this.tick = 0;//帧参数
    this.baseColor = random() * 360;
    this.simplex = new SimplexNoise();
    this.tentacles = [];
    this.tentacleTimer = null;//点击事件延时计时器
    this._setTentacle();
    this._tentacleMove = this._tentacleMove.bind(this);
    setTimeout(() => {
      window.addEventListener("click", this._tentacleMove)
    }, 1000)//2秒后添加监听事件,避免点击启用动画时将动画聚焦到该点  
  }
  _setTentacle() {
    for (let i = 0; i < tentacleConfig.tentacleCount; i++) {
      const t = i / tentacleConfig.tentacleCount * 2 * PI;
      this.tentacles.push(new Tentacle(this.bufferCtx,
        this.viewport.centerX + tentacleConfig.colonyRadius * cos(random() * 2 * PI),
        this.viewport.centerY + tentacleConfig.colonyRadius * sin(random() * 2 * PI),
        round(getRandom(tentacleConfig.segmentCountMin, tentacleConfig.segmentCountMax)),
        round(getRandom(tentacleConfig.segmentLengthMin, tentacleConfig.segmentLengthMax)),
        t, this.baseColor));
    }
  }
  //点击事件
  _tentacleMove(e) {
    clearTimeout(this.tentacleTimer);
    //点击，动画前往点击处
    let r = random() * 100;
    this.tentacles.forEach((tentacle, i) => {
      const t = i / this.tentacles.length * PI * 2;
      tentacle.setTarget([e.clientX + r * cos(t + this.tick * 0.05), e.clientY + r * sin(t + this.tick * 0.05)]);
      tentacle.follow = true;
    });
    //用户点击3s后，若无再次点击，随机移动
    this.tentacleTimer = setTimeout(() => {
      this.tentacles.forEach(tentacle => {
        tentacle.base = [
          tentacle.position[0] + tentacleConfig.colonyRadius * cos(random() * PI * 2),
          tentacle.position[1] + tentacleConfig.colonyRadius * sin(random() * PI * 2)];

        tentacle.setTarget(tentacle.base);
        tentacle.follow = false;
      });
    }, 3000)
  }
  update() {
    this.bufferCtx.clearRect(0, 0, this.viewport.width + 10, this.viewport.height + 10);

    this.ctx.fillStyle = "#00000a80";
    this.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

    this.tick++;
    this.tentacles.map(tentacle => tentacle.update(this.tick))
  }
  onExit() {
    clearTimeout(this.tentacleTimer);
    window.removeEventListener("click", this._tentacleMove);
  }
}

function DOMContentLoadedSet() {
  canvasEngines.push(new CanvasEngine(document.getElementById("canvas-high-res"), true));
  canvasEngines.push(new CanvasEngine(document.getElementById("canvas-low-res"), false));
}

function homePageInit() {
  if (window.localStorage.getItem("disableBack") === "true") return;
  setAnimationScene();
}

function setAnimationScene() {
  const webTheme = window.localStorage.getItem("webTheme");
  if (webTheme === "dark") {
    canvasEngines.forEach(item => item.stop());
    if (random() > .9) {
      canvasEngines[0].setScene(new Kaleidoscope(canvasEngines[0].renderContext));
      canvasEngines[0].start();
    }
    else {
      canvasEngines[1].setScene(new TentacleManger(canvasEngines[1].renderContext))
      canvasEngines[1].start();
    }
  }
  else {
    canvasEngines.forEach(item => item.stop());
    canvasEngines[0].setScene(new VineManger(canvasEngines[0].renderContext));
    canvasEngines[0].start();
  }
}

window.addEventListener("DOMContentLoaded", DOMContentLoadedSet);
window.addEventListener("pageshow", homePageInit);

toggleTheme.addEventListener("click", () => {
  if (window.localStorage.getItem("disableBack") === "true") return;
  setAnimationScene();
});

clearBack.addEventListener("click", () => {
  const allStoped = canvasEngines.every(item => !item.running);
  if(allStoped){
    showMsg("未启用动画，无需清除");
  }
  canvasEngines.forEach(item => {
      item.stop();
  })
})

disableBack.addEventListener("click", () => {
  if (window.localStorage.getItem("disableBack") === "false") {
    canvasEngines.forEach(item => item.stop());
    disableBack.textContent = "启用背景";
    showMsg("已在全局禁用canvas背景");
    window.localStorage.setItem("disableBack", "true");
  }
  else {
    setAnimationScene();
    disableBack.textContent = "禁用背景";
    showMsg("已启用canvas背景");
    window.localStorage.setItem("disableBack", "false");
  }
})