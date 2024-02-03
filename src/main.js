/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import * as Shapes from "./modules/shapes.js";

/* FUNCTIONS */

function toggleSetupPanel() {
  $("#inner_wrapper").classList.toggle("showPanel");
}

function startgame() {
  $("#gamestatus").innerHTML = "The Game is Live";
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
  log(timeElapsed);
  if (timeElapsed < 200) {
    Shapes.activateSeekingMine({ x: pointer.x, y: pointer.y });
  }
}

// function swipeLeft(e) {
//   let coordinates = getEventCoordinates(e);
//   if (coordinates.x < pointer.x && !pointer.press) {
//     toggleSetupPanel();
//   }
// }

// function swipeRight(e) {
//   let coordinates = getEventCoordinates(e);
//   if (coordinates.x > pointer.x && !pointer.press) {
//     toggleSetupPanel();
//   }
// }

function swipeHorizontal(e) {
  let coordinates = getEventCoordinates(e);
  let panel = $("#inner_wrapper");

  let swipeLeft =
    coordinates.x < pointer.x &&
    !pointer.press &&
    Date.now() - pointer.start < 350;

  let swipeRight =
    coordinates.x > pointer.x &&
    !pointer.press &&
    Date.now() - pointer.start < 350;

  if (swipeLeft) {
    panel.classList.add("showPanel");
  }

  if (swipeRight) {
    panel.classList.remove("showPanel");
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
}

function getEventCoordinates(e) {
  let rect = e.target.getBoundingClientRect();
  if ("changedTouches" in e) {
    // if event is a "touch" event then...
    return {
      x: e.changedTouches[0].clientX - rect.left,
      y: e.changedTouches[0].clientY - rect.top,
    };
  } else {
    // otherwise handle as a "mouse click" event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}

function setPointerCoordinates(e) {
  let coordinates = getEventCoordinates(e);
  pointer.x = coordinates.x;
  pointer.y = coordinates.y;
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
  // indicate press & hold
  let timeElapsed = Date.now() - pointer.start;
  let positionChanged =
    Math.abs(pointer.y - pointer.shiftedY) > 0 ||
    Math.abs(pointer.x - pointer.shiftedX) > 0;
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

document.addEventListener("DOMContentLoaded", async () => {
  // socket.emit("latency", Date.now());
  await Shapes.init();
  animationLoop.start();
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// $("#handle").addEventListener("click", handle);

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
  setPointerCoordinates(e);
  inputstart(e);
});

$("#canvas").addEventListener("mouseup", (e) => {
  inputrelease(e);
});

$("#canvas").addEventListener("mousemove", (e) => {
  shiftCoordinates(e);
});

$("#canvas").addEventListener("touchstart", (e) => {
  e.preventDefault();
  setPointerCoordinates(e);
  inputstart(e);
});

$("#canvas").addEventListener("touchend", (e) => {
  inputrelease(e);
});

$("#setup_wrapper").addEventListener("touchstart", (e) => {
  inputstart(e);
  setPointerCoordinates(e);
});

$("#setup_wrapper").addEventListener("mousedown", (e) => {
  inputstart(e);
  setPointerCoordinates(e);
});

$("#setup_wrapper").addEventListener("touchend", (e) => {
  inputrelease(e);
});

$("#setup_wrapper").addEventListener("mouseup", (e) => {
  inputrelease(e);
});

$("#canvas").addEventListener("touchmove", (e) => {
  e.preventDefault();
  shiftCoordinates(e);
});
