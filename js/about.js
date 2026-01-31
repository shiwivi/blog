if (window.localStorage.getItem("webTheme") == "dark") {
    document.documentElement.classList.add("dark-theme");

    const patterns = document.querySelector('.pattern').querySelectorAll('.pattern-node');
    let patternsData = [2, 4, 6, -2, -4, 8];
    let pattenCss = ['rotateZ(15deg)', 'rotateZ(-18deg)', 'rotateZ(55deg)', 'scale(.7) rotateZ(15deg)', 'rotateZ(115deg)', 'rotateZ(180deg)'];
    window.addEventListener('mousemove', function (e) {
        patterns.forEach((ele, index) => {
            let dx = e.pageX / 100 * patternsData[index];
            let dy = e.pageY / 100 * patternsData[index];
            ele.style.transform = `translate(${dx}px,${dy}px) ${pattenCss[index]}`;
        });
    })
}
else {
    document.querySelector(".pattern").style.display = "none";
}
let blurBtn = document.querySelector('.wenzi');
let blurFlag = true;
blurBtn.addEventListener('click', function () {
    if (blurFlag) {
        document.querySelector('.glass').style.backdropFilter = "blur(0px)";
        blurFlag = false;
    }
    else {
        document.querySelector('.glass').style.backdropFilter = "blur(3px)";
        blurFlag = true;
    }
})
console.log([
    "          _____                    _____                    _____                    _____                    _____",
    "         /\\    \\                  /\\    \\                  /\\    \\                  /\\    \\                  /\\    \\       ",
    "        /::\\    \\                /::\\____\\                /::\\    \\                /::\\____\\                /::\\    \\        ",
    "       /::::\\    \\              /:::/    /                \\:::\\    \\              /:::/    /                \\:::\\    \\       ",
    "      /::::::\\    \\            /:::/    /                  \\:::\\    \\            /:::/   _/___               \\:::\\    \\      ",
    "     /:::/\\:::\\    \\          /:::/    /                    \\:::\\    \\          /:::/   /\\    \\               \\:::\\    \\     ",
    "    /:::/__\\:::\\    \\        /:::/____/                      \\:::\\    \\        /:::/   /::\\____\\               \\:::\\    \\    ",
    "    \\:::\\   \\:::\\    \\      /::::\\    \\                      /::::\\    \\      /:::/   /:::/    /               /::::\\    \\   ",
    "  ___\\:::\\   \\:::\\    \\    /::::::\\    \\   _____    ____    /::::::\\    \\    /:::/   /:::/   _/___    ____    /::::::\\    \\  ",
    " /\\   \\:::\\   \\:::\\    \\  /:::/\\:::\\    \\ /\\    \\  /\\   \\  /:::/\\:::\\    \\  /:::/___/:::/   /\\    \\  /\\   \\  /:::/\\:::\\    \\ ",
    "/::\\   \\:::\\   \\:::\\____\\/:::/  \\:::\\    /::\\____\\/::\\   \\/:::/  \\:::\\____\\|:::|   /:::/   /::\\____\\/::\\   \\/:::/  \\:::\\____\\ ",
    "\\:::\\   \\:::\\   \\::/    /\\::/    \\:::\\  /:::/    /\\:::\\  /:::/    \\::/    /|:::|__/:::/   /:::/    /\\:::\\  /:::/    \\::/    /",
    " \\:::\\   \\:::\\   \\/____/  \\/____/ \\:::\\/:::/    /  \\:::\\/:::/    / \\/____/  \\:::\\/:::/   /:::/    /  \\:::\\/:::/    / \\/____/ ",
    "  \\:::\\   \\:::\\    \\               \\::::::/    /    \\::::::/    /            \\::::::/   /:::/    /    \\::::::/    /          ",
    "   \\:::\\   \\:::\\____\\               \\::::/    /      \\::::/____/              \\::::/___/:::/    /      \\::::/____/           ",
    "    \\:::\\  /:::/    /               /:::/    /        \\:::\\    \\               \\:::\\__/:::/    /        \\:::\\    \\           ",
    "     \\:::\\/:::/    /               /:::/    /          \\:::\\    \\               \\::::::::/    /          \\:::\\    \\          ",
    "      \\::::::/    /               /:::/    /            \\:::\\    \\               \\::::::/    /            \\:::\\    \\         ",
    "       \\::::/    /               /:::/    /              \\:::\\____\\               \\::::/    /              \\:::\\____\\        ",
    "        \\::/    /                \\::/    /                \\::/    /                \\::/____/                \\::/    /        ",
    "         \\/____/                  \\/____/                  \\/____/                  ~~                       \\/____/         ",
    "shiwivi.com"
].join('\n'));