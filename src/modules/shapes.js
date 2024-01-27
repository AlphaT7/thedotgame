const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

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
    ctx.shadowColor = "#80E8DD";
    ctx.shadowBlur = 5;
    ctx.stroke();
  });
}

function radiusTicks(ticks, cx, cy) {
  let r1;
  let r2 = 55;
  let radianCircle = [];

  let limit = ticks * 6 < 360 ? ticks * 6 : 360;

  for (
    let i = 0, j = 0, degrees = 270;
    i < limit;
    i += 12, degrees += 12, j++
  ) {
    r1 = j % 2 != 0 ? 40 : 55; // this alternating the radius length creates a jagged visual effect for the radiusTicks;
    let p1 = {
      x: r1 * Math.cos(toRadians(degrees)) + cx,
      y: r1 * Math.sin(toRadians(degrees)) + cy,
    };
    let p2 = {
      x: r2 * Math.cos(toRadians(degrees)) + cx,
      y: r2 * Math.sin(toRadians(degrees)) + cy,
    };

    // let color = "#FFA500";
    //let color = "#80E8DD";
    let color = "#80E8DD";

    radianCircle.push({ p1: p1, p2: p2, color: color });
  }
  return radianCircle;
}

function drawDirectional(centerX, centerY, shiftedX, shiftedY) {
  let r = {
    x: Math.abs(centerX) - Math.abs(shiftedX),
    y: Math.abs(centerY) - Math.abs(shiftedY),
  };

  let x1 = shiftedX + r.x * 3;
  let y1 = shiftedY + r.y * 3;
  let x2 = shiftedX;
  let y2 = shiftedY;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawSeekingMine(centerX, centerY) {}

function touchRadius(ticks, x, y) {
  drawCircleTicks(radiusTicks(ticks, x, y));
}

function directional(pointer) {
  drawDirectional(pointer.x, pointer.y, pointer.shiftedX, pointer.shiftedY);
}

function seekingMine(pointer) {
  drawSeekingMine(pointer.x, pointer.y);
}

export { touchRadius, directional, seekingMine };
