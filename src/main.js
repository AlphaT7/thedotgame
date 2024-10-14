/* MODULE IMPORTS */
// import { io } from "socket.io-client";
import Sound from "./modules/sound.js";
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
    sound.sidepanel.play();
    // sound.transition2.play();
  }

  if (swipeRight) {
    panel.classList.remove("showPanel");
  }
}

async function swipeVertical(e) {
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
    enableTyping = true;
    panel.classList.add("showButtons");
    sound.transition1.play();
  }

  if (swipeDown) {
    enableTyping = false;
    await sleep(70);
    enableTyping = false;
    $("#terminalText").innerHTML = "";
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
  if (pointer.press && pointer.activeTicks >= 59)
    Shapes.activateFlagSeeker(pointer.path);
  if (!pointer.press) {
    swipeHorizontal(e);
    swipeVertical(e);
  }
  pointer.active = false;
  pointer.outofbounds = false;
  pointer.end = Date.now();
  pointer.press = false;
  pointer.path = [];
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

function manualPath(e) {
  if (pointer.press && pointer.activeTicks >= 59) {
    let el = canvas.getBoundingClientRect();
    pointer.path.push({ x: e.clientX - el.left, y: e.clientY - el.top });
  }
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
  if (!enableTyping) return;
  enableTyping = false;
  let text = {
    bounce:
      "Your Flag-Seekers can bounce one time off either side of the screen.",
    manualPathing: "Manually draw your Flag-Seekers path.",
    speed: "Add a speed boost to your Flag-Seekers.",
    spaceShift:
      "Your Flag-Seekers can teleport through the sides of the screen.",
    movableMines: "Enable the removal and re-placement of your Seeking-Mines.",
    additionalUnit:
      "Increase your total number of units available from 3 to 4.",
    expandRadius: "Increase the trigger radius of your Seeking-Mines by 100%.",
    flagSeekerShield:
      "Your Flag-Seekers become immune to the first Seeking-Mine they trigger.",
    radarPulse: "Your opponents Seeking-Mines are now visible to you.",
    deployTimeReduction:
      "Decrease the deploy time of your Flag-Seekers from a to b.",
    flagDecoy: "Deploy Decoy-Flags to distract the Flag Seekers.",
    invisibleFlagSeekers:
      "Your Flag-Seekers are invisible to your opponent until they reach the flag.",
  };

  $("#" + elId).innerHTML = "";
  await sleep(50);
  enableTyping = true;
  await sleep(70);
  for (let char of text[type]) {
    if (!enableTyping) break;
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
  path: [],
};

let sound = {
  start: new Object(),
};

let enableTyping = false;
// let talentTier = {
//   t1: "",
//   t2: "",
//   t3: "",
//   t4: "",
// };

const animationLoop = {
  lastTick: performance.now(),
  frame: () => {},
  start: () => {
    animationLoop.frame = window.requestAnimationFrame(animationLoop.tick);
  },
  stop: () => {
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
  manualPath(e);
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
    let timeElapsed = Date.now() - pointer.end;
    if (timeElapsed < 300) {
      typeIt("terminalText", e.target.id);
      e.target.classList.add("btnFlash");
      setTimeout(() => {
        e.target.classList.remove("btnFlash");
      }, 3500);
    }
  });
});

/* BUTTONS */

$("#submitGameName").addEventListener("click", (e) => {
  sound.button.play();
  let formData = new FormData($("#creategame"));
  socket.emit("newgame", formData.get("gamename"));
});

$("#ripple").addEventListener("click", async (e) => {
  sound.start = new Sound({
    src: "./sound/load.wav",
    volume: 0.5,
  });

  $("#ripple").classList.add("hideripple");
  setTimeout(() => {
    $("#ripple").style.display = "none";
  }, 1100);
  await Shapes.init();
  animationLoop.start();
  sound.start.play();

  sound.transition1 = new Sound({
    src: "./sound/transition1.wav",
    volume: 0.25,
  });
  sound.transition2 = new Sound({
    src: "./sound/transition2.mp3",
    volume: 1,
  });
  sound.button = new Sound({
    src: "./sound/button.wav",
    volume: 1,
  });
  sound.typing = new Sound({
    src: "./sound/typeEffect.mp3",
    volume: 1,
  });
  sound.sidepanel = new Sound({
    src: "./sound/sidePanel.mp3",
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

for (let i = 1; i <= 4; i++) {
  document.getElementsByName("tier" + i).forEach((el) => {
    el.addEventListener("change", (e) => {
      // add event listeners to each of the radio buttons for the talent tiers
      // on "change", update the Shapes.Game.talent properties.
      Shapes.Game.talent["t" + i] = e.target.value;
      Shapes.Game.playerUnitLimit = e.target.value == "additional" ? 4 : 3;
      Shapes.Game.playerUnitTypeLimit = e.target.value == "additional" ? 3 : 2;
    });
  });
}
