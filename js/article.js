const tocBtn = document.querySelector(".toc-btn");
const tocWrapper = document.querySelector(".toc-wrapper");
const articleContent = document.querySelector('.art-content')
//折叠栏
const contentFoldedList = document.querySelectorAll(".content-folded");
if (contentFoldedList) {
    contentFoldedList.forEach(item => {
        let foldFlag = false;
        let foldBtn = document.createElement("div");
        foldBtn.textContent = "展开";
        foldBtn.className = "fold-btn";
        item.appendChild(foldBtn);
        foldBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (foldFlag) {
                item.style.height = "200px";
                foldBtn.textContent = "展开";
                foldFlag = false;
            }
            else {
                item.style.height = item.scrollHeight + 30 + "px";
                foldBtn.textContent = "收起";
                foldFlag = true;
            }
            item.classList.toggle("unfolded");
            foldBtn.classList.toggle("fold-btn-unfolded");
        })
        window.addEventListener("resize", function () {
            if (foldFlag) {
                item.style.height = "max-content";
            }
        })
    })
}
//代码高亮初始化
hljs.highlightAll();
hljs.initLineNumbersOnLoad();

tocBtn.addEventListener("click", function () {
    tocWrapper.classList.toggle("toc-wrapper-active");
})
//二级标题dom
let contentH2 = articleContent.querySelectorAll('h2');
if (contentH2) {
    contentH2.forEach(h2Dom => {
        let H2iconContainer = document.createElement('div');
        H2iconContainer.classList.add('H2-icon-container');
        for (let i = 1; i <= 3; i++) {
            const iconBox = document.createElement('div');
            iconBox.classList.add('H2-icon-box', `H2-icon-box${i}`);
            H2iconContainer.appendChild(iconBox);
        }
        h2Dom.insertAdjacentElement('afterbegin', H2iconContainer);
    })
}

//图片懒加载
let imgs = articleContent.querySelectorAll('img');
if (imgs) {
    imgs.forEach(img => {
        let imgWrapper = document.createElement('div');
        let loadWrapper=document.createElement('div');
        imgWrapper.className = "img-wrapper";
        loadWrapper.className="load-wrapper"
        loadWrapper.innerHTML = `
        <div class="load-line"></div>
        <div class="load-line"></div>
        <div class="load-line"></div>
        <div class="load-text">
            <span>Loading</span>
            <span class="point-text">o</span>
            <span class="point-text">.</span>
            <span class="point-text">0</span>
        </div>`;
        imgWrapper.appendChild(loadWrapper);
        img.parentNode.insertBefore(imgWrapper,img);
        imgWrapper.appendChild(img);
        // img.insertAdjacentElement('beforebegin', imgWrapper);
        // imgWrapper.insertBefore(img, null);
    })
}
const viewH = document.documentElement.clientHeight;
const imgWrappers = document.querySelectorAll('.img-wrapper');

function loadImg(imgIndex) {
    if (imgWrappers[imgIndex].getBoundingClientRect().top < viewH) {
        imgs[imgIndex].src = imgs[imgIndex].dataset.src;
        imgs[imgIndex].onload = function () {
            this.parentNode.querySelector('.load-wrapper').style = "display:none;";
        }
    }
}
for (let i = 0; i < imgWrappers.length; i++) {
    loadImg(i);
}
function throttleLazyload() {
    let imgIndex = 0;
    let timer = null;
    return function () {
        if (!timer) {
            timer = setTimeout(() => {
                if (imgIndex >= imgWrappers.length) {
                    main.removeEventListener('scroll', throttleLazyload);
                    return;
                }
                if (imgWrappers[imgIndex].getBoundingClientRect().top < viewH) {
                    imgs[imgIndex].src = imgs[imgIndex].dataset.src;
                    imgs[imgIndex].onload = function () {
                        this.parentNode.querySelector('.load-wrapper').style = "display:none;";
                    }
                    imgIndex++;
                }
                timer = null;
            }, 300)
        }
    }
}

main.addEventListener('scroll', throttleLazyload());
const pres = document.querySelectorAll('pre');
if (pres) {
    for (let i = 0; i < pres.length; i++) {
        let copyBtn = document.createElement('span');
        copyBtn.innerText = "copy";
        pres[i].appendChild(copyBtn);
        copyBtn.addEventListener("click", function () {
            let codeContent = pres[i].querySelector('code').innerText;
            try {
                let codeContainer = document.createElement('textarea');
                pres[i].appendChild(codeContainer);
                codeContainer.value = codeContent;
                codeContainer.select();
                document.execCommand("copy");
                showMsg("代码已粘贴至剪贴板！");
                pres[i].removeChild(codeContainer);
            } catch (e) {
                try {
                    navigator.clipboard.writeText(codeContent);
                    showMsg("代码已粘贴至剪贴板！");
                } catch (e) {
                    showMsg("浏览器不支持，请手动复制");
                    console.error(error);
                }
            }
        }, false)
    }
}

