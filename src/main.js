/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import * as Shapes from "./modules/shapes.js";

/* FUNCTIONS */

function toggleSetupPanel() {
  $("#game_wrapper").classList.toggle("showPanel");
}

function startgame() {
  toggleSetupPanel();
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
  let timeElapsed = Date.now() - pointer.end;
  if (timeElapsed < 300) {
    Shapes.activateSeekingMine({ x: pointer.x, y: pointer.y });
  }
}

function swipeHorizontal(e) {
  let coordinates = getEventCoordinates(e);
  let panel = $("#game_wrapper");

  let swipeLeft =
    coordinates.x < pointer.x &&
    Math.abs(coordinates.x - pointer.x) > 100 &&
    !pointer.press &&
    !$("#row_wrapper").classList.contains("showButtons");

  let swipeRight =
    coordinates.x > pointer.x &&
    Math.abs(coordinates.x - pointer.x) > 100 &&
    !pointer.press &&
    !$("#row_wrapper").classList.contains("showButtons");

  if (swipeLeft) {
    panel.classList.add("showPanel");
  }

  if (swipeRight) {
    panel.classList.remove("showPanel");
  }
}

function swipeVertical(e) {
  let coordinates = getEventCoordinates(e);
  let panel = $("#row_wrapper");
  let swipeUp =
    coordinates.y < pointer.y &&
    Math.abs(coordinates.y - pointer.y) > 100 &&
    !pointer.press &&
    !$("#game_wrapper").classList.contains("showPanel");

  let swipeDown =
    coordinates.y > pointer.y &&
    Math.abs(coordinates.y - pointer.y) > 100 &&
    !pointer.press &&
    !$("#game_wrapper").classList.contains("showPanel");

  if (swipeUp) {
    panel.classList.add("showButtons");
  }

  if (swipeDown) {
    panel.classList.remove("showButtons");
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

function inputstart(e) {
  pointer.active = true;
  pointer.start = Date.now();
  pointer.shiftedX = pointer.x;
  pointer.shiftedY = pointer.y;
  if (pointer.end == undefined) pointer.end = Date.now();
}

function inputrelease(e) {
  if (e.target == $("#canvas")) doubleTap();
  pointer.active = false;
  pointer.outofbounds = false;
  pointer.end = Date.now();
  pointer.press = false;
  swipeHorizontal(e);
  swipeVertical(e);
}

function getEventCoordinates(e) {
  let rect = $("#canvas").getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function setPointerCoordinates(e) {
  let coordinates = getEventCoordinates(e);
  pointer.x = coordinates.x;
  pointer.y = coordinates.y;
}

function shiftCoordinates(e) {
  let rect = $("#canvas").getBoundingClientRect();
  pointer.shiftedX = e.clientX - rect.left;
  pointer.shiftedY = e.clientY - rect.top;
}

function animationUpdate() {
  // indicate press & hold
  let timeElapsed = Date.now() - pointer.start;

  let positionChanged =
    Math.abs(pointer.y - pointer.shiftedY) > 20 ||
    Math.abs(pointer.x - pointer.shiftedX) > 20;

  if (
    pointer.active &&
    pointer.activeTicks < 60 &&
    timeElapsed > 350 &&
    !positionChanged &&
    !pointer.outofbounds
  ) {
    pointer.outofbounds = isOutOfBounds(pointer.x, pointer.y);
    if (!pointer.outofbounds) {
      pointer.press = true;
      pointer.activeTicks += 4;
      pointer.shiftedX = pointer.x;
      pointer.shiftedY = pointer.y;
    }
  } else if (!pointer.active && pointer.activeTicks > 0) {
    pointer.activeTicks -= 8;
  } else if (!pointer.active && pointer.activeTicks < 0) {
    pointer.activeTicks = 0;
    pointer.vibration = true;
  }
}

function animationRender() {
  Shapes.boundryLine();

  Shapes.seekingMine();

  Shapes.touchRadius(pointer.activeTicks, pointer.x, pointer.y);

  Shapes.directional(pointer);

  pointer.vibrate();

  Shapes.playerGoal();

  Shapes.opponentGoal();

  Shapes.playerFlag(pointer.playerFlag);

  Shapes.opponentFlag();

  Shapes.showBoundry(pointer.outofbounds);

  Shapes.launchSeeker(pointer.end);
}

/* GLOBAL VARIABLES */

const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");
const regex =
  /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const isMobile = regex.test(navigator.userAgent);

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
  activeTicks: 0,
  vibration: true,
  start: Date.now(),
  end: Date.now(),
  press: false,
  pressEnd: Date.now(),
  outofbounds: false,
  vibrate: () => {
    if (pointer.active && pointer.activeTicks >= 59) {
      if ("vibrate" in navigator && pointer.vibration) {
        pointer.vibration = false;
        navigator.vibrate(15);
      }
    }
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

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

/* OUTER WRAPPER */

// $("#outer_wrapper").addEventListener("pointerdown", (e) => {
$("#canvas").addEventListener("pointerdown", (e) => {
  setPointerCoordinates(e);
  inputstart(e);
});

$("#canvas").addEventListener("pointerup", (e) => {
  inputrelease(e);
});

$("#canvas").addEventListener("pointermove", (e) => {
  shiftCoordinates(e);
});

/* SETUP WRAPPER */

$("#setup_wrapper").addEventListener("pointerdown", (e) => {
  inputstart(e);
  setPointerCoordinates(e);
});

$("#setup_wrapper").addEventListener("pointerup", (e) => {
  inputrelease(e);
});

/* BUTTONS WRAPPER */

$("#buttons_wrapper").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  inputstart(e);
  setPointerCoordinates(e);
});

$("#buttons_wrapper").addEventListener("pointerup", (e) => {
  inputrelease(e);
});

/* BUTTONS */

$("#submitGameName").addEventListener("click", (e) => {
  let formData = new FormData($("#creategame"));
  socket.emit("newgame", formData.get("gamename"));
});

$("#ripple").addEventListener("click", async (e) => {
  $("#ripple").classList.add("hideripple");
  setTimeout(() => {
    $("#ripple").style.display = "none";
  }, 1100);
  await Shapes.init();
  animationLoop.start();
});

$("#joingame").addEventListener("submit", (e) => {
  let formData = new FormData($("#joingame"));
  socket.emit("joingame", formData.get("gamelist"));
});
