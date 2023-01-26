window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
    let illustration = document.getElementById("illustration");
    let computedStyle = getComputedStyle(illustration);

    let width = parseInt(computedStyle.getPropertyValue("width"), 10);
    let height = parseInt(computedStyle.getPropertyValue("height"), 10);

    let canvas = document.getElementById("canvas")

    canvas.width = width;
    canvas.height = height;
};

let marker = "#1c1332";
let markerWidth = 4;
let lastEvent;
let mouseDown = false;

let context = $("#canvas")[0].getContext("2d");
let $canvas = $("#canvas");

$canvas.mousedown(function(e) {
    lastEvent = e;
    mouseDown = true;
    console.log(lastEvent);
}).mousemove(function(e) {
    if(mouseDown) {
        context.beginPath();
        context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
        context.lineTo(e.offsetX, e.offsetY);
        context.lineWidth = markerWidth;
        context.strokeStyle = marker;
        context.lineCap = "round";
        context.stroke();

        lastEvent = e;
    }
}).mouseup(function() {
    mouseDown = false;
}).mouseleave(function() {
    mouseDown = false;
});