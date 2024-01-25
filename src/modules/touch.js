const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

function press(ticks, x, y) {
  drawCircleTicks(clockTicks(ticks, x, y));
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function drawCircleTicks(radianCircle) {
  radianCircle.forEach((tick) => {
    ctx.beginPath();
    ctx.strokeStyle = tick.color;
    ctx.lineWidth = 2;
    ctx.moveTo(tick.p1.x, tick.p1.y);
    ctx.lineTo(tick.p2.x, tick.p2.y);
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.stroke();
  });
}

function clockTicks(ticks, cx, cy) {
  let r1;
  let r2 = 70;
  let radionCircle = [];
  for (let i = 0, j = 0; i < 360; i += 6, j++) {
    r1 = j % 2 != 0 ? 45 : 60; // if i is even then r1 is 120 else r1 is 130
    let p1 = {
      x: r1 * Math.cos(toRadians(i)) + cx,
      y: r1 * Math.sin(toRadians(i)) + cy,
    };
    let p2 = {
      x: r2 * Math.cos(toRadians(i)) + cx,
      y: r2 * Math.sin(toRadians(i)) + cy,
    };

    // let pastColor = "#FFA500";
    let pastColor = "#3A86B7";
    let futureColor = "transparent";

    let color =
      j <= ticks + 45 && j > 45
        ? pastColor
        : j <= ticks - 15 && j >= 0
        ? pastColor
        : futureColor;

    radionCircle.push({ p1: p1, p2: p2, color: color });

    radionCircle.push({ p1: p1, p2: p2, color: color });
  }
  return radionCircle;
}

export { press };
