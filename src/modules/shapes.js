const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

async function displayCanvas() {
  let sleep = async (delay) =>
    new Promise((resolve) => setTimeout(resolve, delay));
  let maxW = 372;
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

function drawDirectional(centerX, centerY, shiftedX, shiftedY) {
  let r = {
    x: Math.abs(centerX) - Math.abs(shiftedX),
    y: Math.abs(centerY) - Math.abs(shiftedY),
  };

  let x1 = shiftedX;
  let y1 = shiftedY;
  let x2 = shiftedX + r.x * 3;
  let y2 = shiftedY + r.y * 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  Game.trajectory = { x1: x1, y1: y1, x2: x2, y2: y2 };
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
      drawFlagSeeker(unit);
      unit.trajectory.forEach((point) => {
        drawFlagSeeker(point);
      });
    }
  });
}

function seekerPreLaunch() {
  let seekerCount = Game.playerUnits.seeker.filter(
    (unit) => unit.active
  ).length;
  let underLimit =
    playerUnitCount() < Game.playerUnitLimit &&
    seekerCount < Game.playerUnitTypeLimit;

  let equation = "straight";

  if (underLimit) {
    let newSeeker = Game.playerUnits.seeker.filter((unit) => !unit.active)[0];
    newSeeker.inQue = true;
    newSeeker.type = "seeker";
    newSeeker.equation = equation;
  }
}

function activateFlagSeeker() {
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
    newSeeker.trajectory = gameObj.seekerEquations[newSeeker.equation]({
      x1: Game.trajectory.x1,
      y1: Game.trajectory.y1,
      x2: Game.trajectory.x2,
      y2: Game.trajectory.y2,
    });
    newSeeker.x = Game.trajectory.x2;
    newSeeker.y = Game.trajectory.y2;
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
    pointer.activeTicks >= 59
  ) {
    if (!Game.playerUnits.seeker.some((unit) => unit.inQue)) seekerPreLaunch();
    drawDirectional(pointer.x, pointer.y, pointer.shiftedX, pointer.shiftedY);
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
    straight: (point) => {
      let pointInterval = 20;
      let trajectoryArray = [{ x: point.x2, y: point.y2 }];
      let m = (point.y2 - point.y1) / (point.x2 - point.x1);
      let trajectoryDistance = Math.sqrt(
        (point.x2 - point.x1) ** 2 + (point.y2 - point.y1) ** 2
      );
      let pointCount = Math.floor(trajectoryDistance / pointInterval);
      let distanceX = (point.x2 - point.x1) / pointCount;

      for (let i = 1; i < pointCount; i++) {
        let x = point.x1 + i * distanceX;
        let y = point.y1 + i * m * distanceX;
        trajectoryArray.push({ x, y });
      }
      log(trajectoryArray);
      return trajectoryArray;
    },
  },
};

let Game = {
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
  trajectory: {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  },
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
};
