const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

function radians(degrees) {
  return degrees * (Math.PI / 180);
}

function drawCircleTicks(radianCircle) {
  radianCircle.forEach((tick) => {
    ctx.beginPath();
    ctx.strokeStyle = tick.color;
    ctx.lineWidth = 2;
    ctx.moveTo(tick.p1.x, tick.p1.y);
    ctx.lineTo(tick.p2.x, tick.p2.y);
    ctx.shadowColor = "#80E8DD";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.stroke();
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
    r1 = j % 2 != 0 ? 40 : 55; // alternating the radius length creates a jagged visual effect for the radiusTicks;
    let p1 = {
      x: r1 * Math.cos(radians(degrees)) + cx,
      y: r1 * Math.sin(radians(degrees)) + cy,
    };
    let p2 = {
      x: r2 * Math.cos(radians(degrees)) + cx,
      y: r2 * Math.sin(radians(degrees)) + cy,
    };

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

function drawSeekingMine(centerX, centerY) {
  function circleTicks() {
    let r1;
    let r2 = 30;
    let color = "rgba(128, 232, 221, .25)";
    let radianCircle = [];

    for (let i = 0, degrees = 90; i < 3; i++, degrees += 120) {
      r1 = 15;
      let p1 = {
        x: r1 * Math.cos(radians(degrees)) + centerX,
        y: r1 * Math.sin(radians(degrees)) + centerY,
      };
      let p2 = {
        x: r2 * Math.cos(radians(degrees)) + centerX,
        y: r2 * Math.sin(radians(degrees)) + centerY,
      };

      radianCircle.push({ p1: p1, p2: p2, color: color });
    }
    return radianCircle;
  }

  // let color = "#80E8DD";
  let color = "#FFA500";

  ctx.strokeStyle = "#80E8DD";
  ctx.shadowColor = "#fff";
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, radians(360));

  if (mineBlink.blink) {
    let timeElapsed = Date.now() - mineBlink.ts;
    if (timeElapsed < 1000) {
      ctx.fill();
    } else {
      mineBlink.blink = false;
      mineBlink.ts = Date.now();
    }
  }

  if (!mineBlink.blink) {
    let timeElapsed = Date.now() - mineBlink.ts;
    if (timeElapsed < 1000) {
      ctx.stroke();
    } else {
      mineBlink.blink = true;
      mineBlink.ts = Date.now();
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  if (mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(65), radians(115));
    ctx.stroke();
    ctx.stroke();
  }
  if (mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(185), radians(235));
    ctx.stroke();
    ctx.stroke();
  }
  if (mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(305), radians(355));
    ctx.stroke();
    ctx.stroke();
  }
  drawCircleTicks(circleTicks());
}

function showBoundry(isOutOfBounds) {
  if (isOutOfBounds) {
    ctx.reset();
    ctx.rect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
    ctx.fill();
  }
}

function boundryLine() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2 - 1);
  ctx.lineTo(canvas.width, canvas.height / 2 - 1);
  ctx.strokeStyle = "#fff";
  ctx.stroke();
}

function playerGoal() {
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, canvas.height, 45, radians(270), radians(360));
  ctx.strokeStyle = "rgba(92, 184, 92, .55)";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, canvas.height, 30, radians(270), radians(360));
  ctx.stroke();
  ctx.lineWIdth = 1;
}

function playerFlag(flag) {
  if (flag.img.complete) {
    ctx.drawImage(flag.img, flag.x, flag.y);
  }
  ctx.beginPath();
  // ctx.moveTo(flag.x, flag.y);
  ctx.arc(flag.x + 5, flag.y + 5, 25, radians(0), radians(360));
  ctx.strokeStyle = "#fff";
  ctx.stroke();
}

function touchRadius(ticks, x, y) {
  drawCircleTicks(radiusTicks(ticks, x, y));
}

function directional(pointer) {
  drawDirectional(pointer.x, pointer.y, pointer.shiftedX, pointer.shiftedY);
}

function seekingMine(playerUnits) {
  let count = 0;

  playerUnits.forEach((unit) => {
    if (unit.active && unit.type == "mine" && count < 2) {
      drawSeekingMine(unit.x, unit.y);
      count++;
    }
  });
}

let mineBlink = {
  blink: false,
  ts: Date.now(),
};

export {
  touchRadius,
  directional,
  seekingMine,
  showBoundry,
  boundryLine,
  playerGoal,
  playerFlag,
};
