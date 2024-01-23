import { io } from "socket.io-client";
const $ = document.querySelector.bind(document);
const log = console.log.bind(console);

let domain =
  window.location.protocol + "//" + window.location.hostname + ":3000";

const socket = io(domain, {
  withCredentials: false,
});

document.addEventListener("DOMContentLoaded", () => {
  socket.emit("test", "testing123");
  socket.emit("latency", Date.now());
});

$("#canvas").style.display = "block";

$("#handle").addEventListener("click", () => {
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
});

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

/* Functions */

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
  $("#gameid").value = data;
  $("#creategamegroup").disabled = true;
  $("#joingamegroup").disabled = true;
}

function gameover() {
  $("#gameid").value = "";
  $("#creategamegroup").disabled = true;
  $("#joingamegroup").disabled = true;
}

/* Socket.IO Events */

socket.on("error", (data) => {
  log(data);
});

socket.on("success", (data) => {
  log(data);
});

socket.on("gamelistupdate", (data) => {
  gamelistupdate(data);
});

socket.on("test", (data) => {
  log(data);
});

socket.on("gameover", (data) => {
  gameover();
  log(data);
});

socket.on("latency", (time) => {
  $("#latency").value = Date.now() - time;
  //socket.emit("latency", Date.now());
});

socket.on("joingame", (data) => {
  joingame(data);
});

socket.on("newgame", (data) => {
  newgame(data);
});
