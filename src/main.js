/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import * as Shapes from "./modules/shapes.js";

/* FUNCTIONS */

function handle() {
  let status = $("#handle").dataset.state;
  let panel = $("#inner_wrapper");
  if (status == "open" || status == undefined) {
    $("#handle").dataset.state = "closed";
    $("#handle").innerHTML = "chevron_right";
    panel.classList.toggle("showPanel");
  } else {
    $("#handle").dataset.state = "open";
    $("#handle").innerHTML = "chevron_left";
    panel.classList.toggle("showPanel");
  }
}

function startgame() {
  $("#gamestatus").innerHTML = "The Game is Live";
  handle();
}

function gamelistupdate(data) {
  $("#gamelist").innerHTML = "";
  data.forEach((name) => {
    let option = new Option(name, name);
    $("#gamelist").append(option);
  });
}

function joingame(data) {
  $("#gamename").value = "";
  $("#gameid").value = data;
  $("#creategamegroup").disabled = true;
  $("#joingamegroup").disabled = true;
}

function newgame(data) {
  $("#gamename").value = "";
  $("#gamestatus").innerHTML = "Waiting for Opponent";
  $("#gameid").value = data;
  $("#creategamegroup").disabled = true;
  $("#joingamegroup").disabled = true;
}

function gameover() {
  $("#gameid").value = "";
  $("#gamestatus").innerHTML = "Game Over";
  $("#creategamegroup").disabled = false;
  $("#joingamegroup").disabled = false;
}

function doubleTap() {
  for (let i = 0; i < 3; i++) {
    if (!uiObjects.playerUnits[i].active) {
      uiObjects.playerUnits[i].x = pointer.x;
      uiObjects.playerUnits[i].y = pointer.y;
      uiObjects.playerUnits[i].active = true;
      uiObjects.playerUnits[i].type = "mine";
      break;
    }
  }
}

function isOutOfBounds(x, y) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.lineTo(0, canvas.height / 2);
  ctx.closePath();
  return ctx.isPointInPath(x, y);
}

function inputstart() {
  pointer.active = true;
  pointer.start = Date.now();
}

function inputrelease() {
  if (Date.now() - pointer.end < 300) doubleTap();
  pointer.active = false;
  pointer.outofbounds = false;
  pointer.end = Date.now();
}

function setCoordinates(e) {
  let rect = e.target.getBoundingClientRect();

  if ("touches" in e) {
    // if event is a "touch"
    pointer.x = e.touches[0].clientX - rect.left;
    pointer.y = e.touches[0].clientY - rect.top;
  } else {
    //otherwise it's a mouse event
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }
}

function shiftCoordinates(e) {
  let rect = e.target.getBoundingClientRect();

  if ("touches" in e) {
    // event is a "touch"
    pointer.shiftedX = e.touches[0].clientX - rect.left;
    pointer.shiftedY = e.touches[0].clientY - rect.top;
  } else {
    // otherwise it's a mouse event
    pointer.shiftedX = e.clientX - rect.left;
    pointer.shiftedY = e.clientY - rect.top;
  }
}

function animationUpdate() {
  // update press/hold indicator
  let timeElapsed = Date.now() - pointer.start;
  if (
    pointer.active &&
    uiObjects.touchTicks < 60 &&
    timeElapsed > 200 &&
    !pointer.outofbounds
  ) {
    pointer.outofbounds = isOutOfBounds(pointer.x, pointer.y);
    uiObjects.touchTicks += 4;
    pointer.shiftedX = pointer.x;
    pointer.shiftedY = pointer.y;
  } else if (!pointer.active && uiObjects.touchTicks > 0) {
    uiObjects.touchTicks -= 8;
  } else if (!pointer.active && uiObjects.touchTicks < 0) {
    uiObjects.touchTicks = 0;
    pointer.vibrate = true;
  }
}

function animationRender() {
  Shapes.boundryLine();

  Shapes.seekingMine(uiObjects.playerUnits);

  Shapes.touchRadius(uiObjects.touchTicks, pointer.x, pointer.y);

  if (pointer.active && uiObjects.touchTicks > 59) {
    if ("vibrate" in navigator && pointer.vibrate) {
      pointer.vibrate = false;
      navigator.vibrate(15);
    }

    // if the pointer coordinates are outside of the touchRadius, then draw the directional;
    let inputChanged =
      Math.abs(pointer.y - pointer.shiftedY) > 55 ||
      Math.abs(pointer.x - pointer.shiftedX) > 55;
    if (inputChanged && !pointer.outofbounds) Shapes.directional(pointer);
  }

  Shapes.playerGoal();

  Shapes.playerFlag(uiObjects.playerFlag);

  Shapes.showBoundry(pointer.outofbounds);
}

/* GLOBAL VARIABLES */

const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

//  window.location.protocol + "//" + window.location.hostname + ":3000";

// const socket = io(domain, {
//   withCredentials: false,
// });

//let gamelive = true;
let pointer = {
  active: false,
  x: 0,
  y: 0,
  shiftedX: 0,
  shiftedY: 0,
  vibrate: true,
  start: Date.now(),
  end: Date.now(),
  outofbounds: false,
};

let uiObjects = {
  touchTicks: 0,
  playerUnits: [
    { x: 0, y: 0, active: false, type: undefined },
    { x: 0, y: 0, active: false, type: undefined },
    { x: 0, y: 0, active: false, type: undefined },
  ],
  playerFlag: {
    img: new Image(),
    x: 0,
    y: 0,
  },
  playerGoal: {
    x: 5,
    y: canvas.height - 5,
  },
};

const animationLoop = {
  lastTick: performance.now(),
  frame: () => {},
  start: () => {
    // log({ start: "start" });
    animationLoop.frame = window.requestAnimationFrame(animationLoop.tick);
  },
  stop: () => {
    // log({ stop: "stop" });
    window.cancelAnimationFrame(animationLoop.frame);
  },
  update: () => {
    animationUpdate();
  },
  render: () => {
    animationRender();
  },
  tick: (now) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animationLoop.update();
    animationLoop.render();
    animationLoop.lastTick = now;
    animationLoop.frame = window.requestAnimationFrame(animationLoop.tick);
  },
};

/* SOCKET.IO EVENTS */

// socket.on("error", (data) => {
//   log(data);
// });

// socket.on("success", (data) => {
//   log(data);
// });

// socket.on("gamelistupdate", (data) => {
//   gamelistupdate(data);
// });

// socket.on("test", (data) => {
//   log(data);
// });

// socket.on("gameover", (data) => {
//   gameover();
//   log(data);
// });

// socket.on("latency", (time) => {
//   $("#latency").value = Date.now() - time;
//   //socket.emit("latency", Date.now());
// });

// socket.on("joingame", (data) => {
//   joingame(data);
// });

// socket.on("newgame", (data) => {
//   newgame(data);
// });

// socket.on("startgame", () => {
//   startgame();
// });

/* EVENT LISTENERS */

document.addEventListener("DOMContentLoaded", () => {
  canvas.width = 375;
  canvas.height = 500;
  // socket.emit("latency", Date.now());
  animationLoop.start();
  uiObjects.playerFlag.img.src = "./img/blue-flag.png";
  uiObjects.playerFlag.x = canvas.width - 20;
  uiObjects.playerFlag.y = canvas.height - 20;
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

$("#handle").addEventListener("click", handle);

$("#creategame").addEventListener("submit", (e) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  socket.emit("newgame", formData.get("gamename"));
});

$("#joingame").addEventListener("submit", (e) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  socket.emit("joingame", formData.get("gamelist"));
});

$("#canvas").addEventListener("mousedown", (e) => {
  setCoordinates(e);
  inputstart();
});

$("#canvas").addEventListener("mouseup", (e) => {
  inputrelease();
});

$("#canvas").addEventListener("mousemove", (e) => {
  shiftCoordinates(e);
});

$("#canvas").addEventListener("touchstart", (e) => {
  e.preventDefault();
  setCoordinates(e);
  inputstart(e);
});

$("#canvas").addEventListener("touchend", (e) => {
  inputrelease();
});

$("#canvas").addEventListener("touchmove", (e) => {
  e.preventDefault();
  shiftCoordinates(e);
});
