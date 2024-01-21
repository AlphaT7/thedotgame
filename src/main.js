import { io } from "socket.io-client";
const $ = document.querySelector.bind(document);
const log = console.log.bind(console);

// let domain =
//   window.location.protocol + "//" + window.location.hostname + ":3000";

const socket = io("http://localhost:3000", {
  withCredentials: false,
});

document.addEventListener("DOMContentLoaded", () => {
  socket.emit("test", "testing123");
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
