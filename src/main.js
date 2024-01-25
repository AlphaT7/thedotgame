/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import * as Touch from "./modules/touch";

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

function inputstart(e) {
  userinput.live = true;
  userinput.ts = Date.now();
}

function inputrelease(e) {
  userinput.live = false;
}

function animationUpdate() {
  // update press/hold indicator
  let timeElapsed = Date.now() - userinput.ts;
  if (userinput.live && uiObjects.touchTicks < 60 && timeElapsed > 200) {
    uiObjects.touchTicks += 4;
  } else if (!userinput.live && uiObjects.touchTicks > 0) {
    uiObjects.touchTicks -= 8;
  } else if (!userinput.live && uiObjects.touchTicks < 0) {
    uiObjects.touchTicks = 0;
  }
}

function setCoordinates(e) {
  let rect = e.target.getBoundingClientRect();

  if ("touches" in e) {
    // if event is a "touch"
    userinput.x = e.touches[0].clientX - rect.left;
    userinput.y = e.touches[0].clientY - rect.top;
  } else {
    //otherwise it's a mouse event
    userinput.x = e.clientX - rect.left;
    userinput.y = e.clientY - rect.top;
  }
}

function animationRender() {
  Touch.press(uiObjects.touchTicks, userinput.x, userinput.y);
}

/* GLOBAL VARIABLES */

const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

let domain =
  window.location.protocol + "//" + window.location.hostname + ":3000";

// const socket = io(domain, {
//   withCredentials: false,
// });

let gamelive = true;
let userinput = {
  live: false,
  x: 0,
  y: 0,
  ts: Date.now(),
};

let uiObjects = {
  touchTicks: 0,
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
  inputstart(e);
});

$("#canvas").addEventListener("mouseup", (e) => {
  inputrelease();
});

$("#canvas").addEventListener("touchstart", (e) => {
  setCoordinates(e);
  inputstart(e);
});

$("#canvas").addEventListener("touchend", (e) => {
  inputrelease();
});

/* FUNCTION CALLS */

animationLoop.start();
