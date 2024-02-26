/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import { Howl, Howler } from "howler";
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
    sound.transition2.play();
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
    typing = false;
    sound.transition1.play();
  }

  if (swipeDown) {
    typing = true;
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
  Shapes.activateFlagSeeker();
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

async function typeIt(elId, type) {
  if (typing) return;
  typing = true;
  let text = {
    bounce: "This option enables the Flag Seeker to bounce off the walls.",
    manualPathing:
      "This option enables you to manually draw the Flag Seeker path.",
    speed: "This option adds a speed boost to the Flag Seeker.",
    spaceShift: "This option enables the Flag Seeker to go through walls.",
    movableMines:
      "This option enables the removal and re-placement of a Seeking Mine.",
    additionalUnit:
      "This option increases the total number of units allowed from 3 to 4.",
    expandRadius:
      "This option increases the trigger radius of your Seeking Mines by 100%.",
    flagSeekerShield:
      "This option makes your Flag Seekers immune to the first Seeking Mine they trigger.",
    radarPulse:
      "This options makes your opponents Seeking Mines visible to you.",
  };

  $("#" + elId).innerHTML = "";
  await sleep(50);
  typing = false;

  for (let char of text[type]) {
    log(typing);
    if (typing) break;
    let time = Math.floor(Math.random() * (65 - 16 + 1)) + 16;
    sound.typing.play();
    $("#" + elId).innerHTML += char;
    await sleep(time);
  }
}

async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
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

  Shapes.flagSeeker(pointer.x, pointer.y);
}

/* GLOBAL VARIABLES */

const $ = document.querySelector.bind(document);
const log = console.log.bind(console);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");
// const regex =
//   /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

// const isMobile = regex.test(navigator.userAgent);

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

let sound = {
  start: new Object(),
};

let typing = false;

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

document.querySelectorAll(".action_btn").forEach((el) => {
  el.addEventListener("pointerup", (e) => {
    e.target.classList.add("btnFlash");
    setTimeout(() => {
      e.target.classList.remove("btnFlash");
    }, 700);
  });
});

/* BUTTONS */

$("#submitGameName").addEventListener("click", (e) => {
  sound.button.play();
  let formData = new FormData($("#creategame"));
  socket.emit("newgame", formData.get("gamename"));
});

$("#ripple").addEventListener("click", async (e) => {
  sound.start = new Howl({
    src: ["./sound/load.wav"],
    volume: 0.5,
  });

  $("#ripple").classList.add("hideripple");
  setTimeout(() => {
    $("#ripple").style.display = "none";
  }, 1100);
  await Shapes.init();
  animationLoop.start();
  sound.start.play();

  sound.transition1 = new Howl({
    src: ["./sound/transition1.wav"],
    volume: 0.25,
  });
  sound.transition2 = new Howl({
    src: ["./sound/transition2.mp3"],
    volume: 1,
  });
  sound.button = new Howl({
    src: ["./sound/button.wav"],
    volume: 1,
  });
  sound.typing = new Howl({
    src: ["./sound/typeEffect.mp3"],
    volume: 1,
  });
});

$("#joingame").addEventListener("submit", (e) => {
  let formData = new FormData($("#joingame"));
  socket.emit("joingame", formData.get("gamelist"));
});

$("#joinSelectedGame").addEventListener("pointerup", () => {
  sound.button.play();
});

$("#bounce").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#speed").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#spaceShift").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#movableMines").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#additionalUnit").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#expandRadius").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#flagSeekerShield").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#radarPulse").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});

$("#manualPathing").addEventListener("pointerup", (e) => {
  typeIt("terminalText", e.target.id);
});
