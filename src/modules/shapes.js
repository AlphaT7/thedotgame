const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

async function displayCanvas() {
  let sleep = async (delay) =>
    new Promise((resolve) => setTimeout(resolve, delay));
  let maxW = 372;
  // let maxH = 551; //iphone 6s chrome height
  let maxH = 622;

  let expandW = async () => {
    while (canvas.width < maxW) {
      if (canvas.width + 28 <= maxW) {
        canvas.width += 28;
      } else {
        canvas.width += maxW - canvas.width;
      }
      await sleep(20);
    }
  };

  let expandH = async () => {
    while (canvas.height < maxH) {
      if (canvas.height + 48 <= maxH) {
        canvas.height += 48;
      } else {
        canvas.height += maxH - canvas.height;
      }
      await sleep(20);
    }
  };

  $("#canvas").classList.add("showCanvas");
  await expandW();
  await sleep(300);
  await expandH();
  $("#canvas").classList.add("colorCanvas");
}

async function init() {
  await displayCanvas();

  Game.playerFlag.img.src = "./img/blue-flag.png";
  Game.playerFlag.x = canvas.width - 25;
  Game.playerFlag.y = canvas.height - 25;
  Game.opponentFlag.img.src = "./img/red-flag.png";
  Game.opponentFlag.x = canvas.width - 25;
  Game.opponentFlag.y = 10;
  Game.playerGoal.x = 0;
  Game.playerGoal.y = canvas.height;
  Game.opponentGoal.x = 0;
  Game.opponentGoal.y = 0;
}

function radians(degrees) {
  return degrees * (Math.PI / 180);
}

function playerUnitCount() {
  return (
    Game.playerUnits.seeker.filter((unit) => unit.active).length +
    Game.playerUnits.mine.filter((unit) => unit.active).length
  );
}

function activateSeekingMine(pointer) {
  let mineCount = Game.playerUnits.mine.filter((unit) => unit.active).length;
  let underLimit =
    playerUnitCount() < Game.playerUnitLimit &&
    mineCount < Game.playerUnitTypeLimit;
  let hasInactive = Game.playerUnits.mine.some((unit) => !unit.active);

  if (underLimit && hasInactive) {
    let newMine = Game.playerUnits.mine.filter((unit) => !unit.active)[0];
    newMine.x = pointer.x;
    newMine.y = pointer.y;
    newMine.active = true;
  }
}

function drawCircleTicks(radianCircle, x, y) {
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
    ctx.lineWidth = 1;
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

function calculateAngle(anchor, point) {
  return (
    (Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180) / Math.PI + 180
  );
}

function drawDirectional(centerX, centerY, shiftedX, shiftedY, path) {
  let r = {
    x: Math.abs(centerX) - Math.abs(shiftedX),
    y: Math.abs(centerY) - Math.abs(shiftedY),
  };
  // centerY,centerY is the focal point that the line pivots on; the center of the circle;
  // x1,y1 is the point where the mouse is currently at
  // x2,y2 is the point at the opposite end of x1,y1;
  // midX,midY is the point where X is either intercepting 0 or canvas.width;
  // x3,y3 is the point at the end of the 2nd line after distance and angle refraction has been calculated

  let guidAngle = calculateAngle(
    { x: centerX, y: centerY },
    { x: shiftedX, y: shiftedY }
  );

  let startAngle = (guidAngle - 270) * (Math.PI / 180);
  let endAngle = (guidAngle - 90) * (Math.PI / 180);

  let directionalArc = {
    x: centerX,
    y: centerY,
    r: 75,
    start: startAngle,
    end: endAngle,
  };

  console.log(directionalArc);
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.arc(
    directionalArc.x,
    directionalArc.y,
    directionalArc.r,
    directionalArc.start,
    directionalArc.end
  );
  ctx.stroke();
  ctx.restore();

  let x1 = shiftedX;
  let y1 = shiftedY;
  let x2 = shiftedX + r.x * 3;
  let y2 = shiftedY + r.y * 3;

  let offScreen = isOffScreen(x2, y2);

  if (!offScreen && Game.talent.t1 != "manual") {
    ctx.save();
    ctx.setLineDash([4, 16]);
    ctx.lineDashOffset = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    Game.directional = { x1: x1, y1: y1, x2: x2, y2: y2 };
    return;
  }

  let angle = calculateAngle(
    { x: centerX, y: centerY },
    { x: shiftedX, y: shiftedY }
  );

  switch (Game.talent.t1) {
    case "manual":
      ctx.beginPath();
      path.forEach((point, i) => {
        if (!(i % 5 == 0)) return;
        ctx.save();
        ctx.setLineDash([4, 16]);
        ctx.lineDashOffset = 4;
        ctx.fillStyle = "#fff";
        ctx.lineTo(point.x, point.y);
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
      });

      break;

    case "bounce":
      (() => {
        // calculated the point2 angle, need to subtract the angle from 360 to get the 2nd line angle;
        let reflectedAngle = 360 - angle;
        let m = (y2 - y1) / (x2 - x1);
        // midpoint equals either left or right side of the canvas;
        let midX = x2 < 0 ? 0 : canvas.width;
        let midY = m * (midX - centerX) + centerY;
        let d = calculateDistance({ x1: midX, y1: midY, x2: x2, y2: y2 });
        let angleInRadians = reflectedAngle * (Math.PI / 180);
        let x3 = midX + d * Math.cos(angleInRadians);
        let y3 = midY + d * Math.sin(angleInRadians);

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 16]);
        ctx.lineDashOffset = 4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(midX, midY);
        ctx.lineTo(x3, y3);
        ctx.stroke();
        ctx.restore();
        Game.directional = { x1: x1, y1: y1, x2: midX, y2: midY, x3, y3 };
      })();
      break;

    case "shift":
      (() => {
        let m = (y2 - y1) / (x2 - x1);
        // midpoint equals either left or right side of the canvas;
        let midX = x2 < 0 ? 0 : canvas.width;
        let midY = m * (midX - centerX) + centerY;
        // shift the coordinates to the opposite side of the canvas;
        let x3 = midX == 0 ? canvas.width : 0;
        let y3 = midY;

        let x4 = x2 < canvas.width ? x2 + canvas.width : x2 - canvas.width;
        let y4 = y2;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 16]);
        ctx.lineDashOffset = 4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(midX, midY);
        ctx.moveTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.stroke();
        ctx.restore();
        Game.directional = {
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          x3: x3,
          y3: y3,
          x4: x4,
          y4: y4,
        };
      })();
      break;

    default:
      log("no t1 talent picked");
      break;
  }
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
  // let color = "#FFA500";

  ctx.strokeStyle = "#80E8DD";
  ctx.shadowColor = "#fff";
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, radians(360));

  if (Game.mineBlink.blink) {
    let timeElapsed = Date.now() - Game.mineBlink.ts;
    if (timeElapsed < 1000) {
      ctx.fill();
    } else {
      Game.mineBlink.blink = false;
      Game.mineBlink.ts = Date.now();
    }
  }

  if (!Game.mineBlink.blink) {
    ctx.shadowColor = "#80E8DD";
    let timeElapsed = Date.now() - Game.mineBlink.ts;
    if (timeElapsed < 1000) {
      ctx.stroke();
      ctx.stroke();
      ctx.stroke();
    } else {
      Game.mineBlink.blink = true;
      Game.mineBlink.ts = Date.now();
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,.2)";
  if (Game.mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(65), radians(115));
    ctx.stroke();
    ctx.stroke();
    ctx.stroke();
  }
  if (Game.mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(185), radians(235));
    ctx.stroke();
    ctx.stroke();
    ctx.stroke();
  }
  if (Game.mineBlink.blink) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, radians(305), radians(355));
    ctx.stroke();
    ctx.stroke();
    ctx.stroke();
  }
  drawCircleTicks(circleTicks());
}

function showBoundry(isOutOfBounds) {
  if (isOutOfBounds) {
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
    ctx.fill();
  }
}

function boundryLine() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2 - 1);
  ctx.lineTo(canvas.width, canvas.height / 2 - 1);
  ctx.strokeStyle = "rgba(128, 232, 221, 1)";
  ctx.stroke();
}

function opponentGoal() {
  ctx.shadowColor = "rgba(255, 0, 0, 1)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(
    Game.opponentGoal.x,
    Game.opponentGoal.y,
    30,
    radians(0),
    radians(90)
  );
  ctx.strokeStyle = "rgba(255, 0, 0, .55)";
  ctx.stroke();
  ctx.stroke();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    Game.opponentGoal.x,
    Game.opponentGoal.y,
    45,
    radians(0),
    radians(90)
  );
  ctx.stroke();
  ctx.stroke();
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function playerGoal() {
  // ctx.shadowColor = "rgba(92, 184, 92, 1)";
  ctx.shadowColor = "rgba(0, 109, 240, 1)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(Game.playerGoal.x, Game.playerGoal.y, 45, radians(270), radians(360));
  // ctx.strokeStyle = "rgba(92, 184, 92, .55)";
  ctx.strokeStyle = "rgba(0, 109, 240, .55)";
  ctx.stroke();
  ctx.stroke();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, canvas.height, 30, radians(270), radians(360));
  ctx.stroke();
  ctx.stroke();
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function playerFlag() {
  let flag = Game.playerFlag;
  if (flag.img.complete) {
    ctx.drawImage(flag.img, flag.x, flag.y);
  }

  ctx.beginPath();
  ctx.arc(flag.x + 8, flag.y + 8, 25, radians(0), radians(360));
  ctx.strokeStyle = "#006DF0";
  ctx.stroke();
}

function opponentFlag() {
  // the flag needs some adjustment for the coordinates to visually work
  let flag = Game.opponentFlag;
  if (flag.img.complete) {
    ctx.drawImage(flag.img, flag.x, flag.y);
  }

  ctx.beginPath();
  ctx.arc(flag.x + 8, flag.y + 8, 25, radians(0), radians(360));
  ctx.strokeStyle = "red";
  ctx.stroke();
}

function drawFlagSeeker(unit) {
  ctx.beginPath();
  ctx.fillStyle = "rgba(128, 232, 221, 0.25)";
  ctx.arc(unit.x, unit.y, 20, radians(0), radians(360));
  ctx.fill();
}

function flagSeeker() {
  Game.playerUnits.seeker.forEach((unit) => {
    if (unit.active && unit.type == "seeker") {
      unit.trajectory.forEach((point) => {
        drawFlagSeeker(point);
      });
    }
  });
}

function reserveSeekerUnit() {
  let seekerCount = Game.playerUnits.seeker.filter(
    (unit) => unit.active
  ).length;
  let underLimit =
    playerUnitCount() < Game.playerUnitLimit &&
    seekerCount < Game.playerUnitTypeLimit;

  let isTalentSet = Game.talent.t1 != "";

  if (underLimit && isTalentSet) {
    // select the 1st inactive unit and place it in que
    let newSeeker = Game.playerUnits.seeker.filter((unit) => !unit.active)[0];
    newSeeker.inQue = true;
    newSeeker.type = "seeker";
    newSeeker.equation = Game.talent.t1;
  }
}

function activateFlagSeeker(pointerPath) {
  reserveSeekerUnit();
  let seekerCount = Game.playerUnits.seeker.filter(
    (unit) => unit.active
  ).length;
  let underLimit =
    playerUnitCount() < Game.playerUnitLimit &&
    seekerCount < Game.playerUnitTypeLimit;

  let isInQue = Game.playerUnits.seeker.some((unit) => unit.inQue);

  if (underLimit && isInQue) {
    let newSeeker = Game.playerUnits.seeker.filter(
      (unit) => !unit.active && unit.inQue
    )[0];

    let pathPoints =
      newSeeker.equation != "manual" ? Game.directional : pointerPath;

    newSeeker.trajectory =
      gameObj.seekerEquations[newSeeker.equation](pathPoints);
    newSeeker.x =
      newSeeker.equation != "manual"
        ? Game.directional.x2
        : newSeeker.trajectory[0].x;
    newSeeker.y =
      newSeeker.equation != "manual"
        ? Game.directional.y2
        : newSeeker.trajectory[0].y;
    newSeeker.active = true;
    newSeeker.type = "seeker";
    newSeeker.inQue = false;
  }
}

function touchRadius(ticks, x, y) {
  drawCircleTicks(radiusTicks(ticks, x, y), x, y);
}

function directional(pointer) {
  // if the pointer coordinates are outside of the touchRadius, then draw the directional;
  let inputChanged =
    Math.abs(pointer.y - pointer.shiftedY) > 55 ||
    Math.abs(pointer.x - pointer.shiftedX) > 55;

  if (
    inputChanged &&
    !pointer.outofbounds &&
    pointer.active &&
    pointer.activeTicks >= 59 //&&
  ) {
    drawDirectional(
      pointer.x,
      pointer.y,
      pointer.shiftedX,
      pointer.shiftedY,
      pointer.path
    );
  }
}

function seekingMine() {
  // for (let i = 0; i < 3; i++) {
  //   if (Game.playerUnits[i].active) {
  //     Game.playerUnits[i].x = pointer.x;
  //     Game.playerUnits[i].y = pointer.y;
  //     break;
  //   }
  // }
  Game.playerUnits.mine.forEach((unit) => {
    if (unit.active) drawSeekingMine(unit.x, unit.y);
  });
}

function isOffScreen(x, y) {
  let boundry = { xL: 0, yT: 0, xR: canvas.width, yB: canvas.height };
  return x < boundry.xL || x > boundry.xR || y < boundry.yT || y > boundry.yB;
}

function calculateDistance(point) {
  return Math.sqrt((point.x2 - point.x1) ** 2 + (point.y2 - point.y1) ** 2);
}

let gameObj = {
  seekerObj: {
    x: 0,
    y: 0,
    active: false,
    type: "seeker",
    inQue: false,
    equation: "",
    trajectory: [],
  },
  mineObj: { x: 0, y: 0, active: false, type: "mine" },
  seekerEquations: {
    bounce: (point) => {
      let pointInterval = 20;
      let trajectoryArray = [{ x: point.x2, y: point.y2 }];
      let m = (point.y2 - point.y1) / (point.x2 - point.x1);
      let trajectoryDistance = calculateDistance(point);
      let pointCount = Math.floor(trajectoryDistance / pointInterval);
      let distanceX = (point.x2 - point.x1) / pointCount;

      for (let i = 1; i < pointCount; i++) {
        let x = point.x1 + i * distanceX;
        let y = point.y1 + i * m * distanceX;
        trajectoryArray.push({ x, y });
      }

      if ("x3" in point) {
        // if property x3 has been set...
        let m = (point.y2 - point.y3) / (point.x2 - point.x3);
        let trajectoryDistance = calculateDistance({
          x1: point.x2,
          y1: point.y2,
          x2: point.x3,
          y2: point.y3,
        });
        let pointCount = Math.floor(trajectoryDistance / pointInterval);
        let distanceX = (point.x3 - point.x2) / pointCount;

        for (let i = 1; i < pointCount; i++) {
          let x = point.x2 + i * distanceX;
          let y = point.y2 + i * m * distanceX;
          trajectoryArray.push({ x, y });
        }
      }

      return trajectoryArray;
    },
    manual: (pathPoints) => {
      let pointInterval = 20;
      let newPathPoints = pathPoints.filter(
        (pathPoint, i) => i % pointInterval == 0
      );
      newPathPoints.push(pathPoints.at(-1));
      return newPathPoints;
    },
    shift: (point) => {
      let pointInterval = 20;
      let trajectoryArray = [{ x: point.x2, y: point.y2 }];
      let m = (point.y2 - point.y1) / (point.x2 - point.x1);
      let trajectoryDistance = calculateDistance(point);
      let pointCount = Math.floor(trajectoryDistance / pointInterval);
      let distanceX = (point.x2 - point.x1) / pointCount;

      for (let i = 1; i < pointCount; i++) {
        let x = point.x1 + i * distanceX;
        let y = point.y1 + i * m * distanceX;
        trajectoryArray.push({ x, y });
      }

      if ("x3" in point) {
        trajectoryArray.push({ x: point.x3, y: point.y3 });
        let m = (point.y4 - point.y3) / (point.x4 - point.x3);
        let trajectoryDistance = calculateDistance({
          x1: point.x3,
          y1: point.y3,
          x2: point.x4,
          y2: point.y4,
        });
        let pointCount = Math.floor(trajectoryDistance / pointInterval);
        let distanceX = (point.x4 - point.x3) / pointCount;
        for (let i = 1; i < pointCount; i++) {
          let x = point.x3 + i * distanceX;
          let y = point.y3 + i * m * distanceX;
          trajectoryArray.push({ x, y });
        }
      }

      return trajectoryArray;
    },
  },
};

let Game = {
  talent: {
    t1: "",
    t2: "",
    t3: "",
    t4: "",
  },
  mineBlink: {
    blink: false,
    ts: Date.now(),
  },
  playerUnits: {
    seeker: [
      Object.create(gameObj.seekerObj),
      Object.create(gameObj.seekerObj),
      Object.create(gameObj.seekerObj),
    ],
    mine: [
      Object.create(gameObj.mineObj),
      Object.create(gameObj.mineObj),
      Object.create(gameObj.mineObj),
    ],
  },
  playerFlag: {
    img: new Image(),
    x: 0,
    y: 0,
  },
  playerGoal: {
    x: 0,
    y: 0,
  },
  opponentFlag: {
    img: new Image(),
    x: 0,
    y: 0,
  },
  opponentGoal: {
    x: 0,
    y: 0,
  },
  playerUnitTypeLimit: 2,
  playerUnitLimit: 3,
  directional: {},
};

export {
  touchRadius,
  directional,
  seekingMine,
  activateSeekingMine,
  flagSeeker,
  activateFlagSeeker,
  showBoundry,
  boundryLine,
  playerGoal,
  playerFlag,
  opponentGoal,
  opponentFlag,
  init,
  Game,
};
