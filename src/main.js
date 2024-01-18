import { io } from "socket.io-client";
const $ = document.querySelector.bind(document);
const log = console.log.bind(console);

const socket = io();

log(socket);
socket.emit("test message", "testing123");
