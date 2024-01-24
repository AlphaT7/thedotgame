const httpServer = require("http").createServer();
const db = require("better-sqlite3")("sql.db");
db.pragma("journal_mode = WAL");

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

const log = console.log.bind(console);

httpServer.listen(3000);

function newconnection(socket) {
  log("user connected");
  socket.emit("gamelistupdate", gamelist());
}

function gamelist() {
  return db
    .prepare("SELECT name FROM games WHERE live = false")
    .pluck(true)
    .all();
}

function newgame(gamename, socket) {
  // on "newgame" event, first check for any special chars;
  // end execution if found
  let regex = new RegExp(/[^a-zA-Z0-9]/);
  if (regex.test(gamename)) {
    socket.emit("error", "Only alphanumeric characters are allowed!");
    return;
  }

  // otherwise, check if the new game name exists in the database
  let query = db.prepare("SELECT name FROM games").pluck(true).all();
  let test = query.some((rs) => rs == gamename);

  if (!test) {
    // if the new gamename doesn't exist in the database, insert it
    let insert = db.prepare(
      "INSERT INTO games (name, bluestatus, redstatus) VALUES (?, ?, ?)"
    );

    insert.run(gamename, socket.id, "pending");
    socket.join(gamename);

    // broadcast gamelistupdate to all connections
    io.emit("gamelistupdate", gamelist());
    socket.emit("newgame", gamename);
    socket.emit("success", "Blue player initalized. Waiting for red player...");
  } else {
    // otherwise notify the player that it is already in use;
    socket.emit("error", "Game name already in use!");
  }
}

function joingame(gamename, socket) {
  // on "joingame" event, first check for any special chars;
  // end execution if found
  let regex = new RegExp(/[^a-zA-Z0-9]/);
  if (regex.test(gamename)) {
    socket.emit("error", "Only alphanumeric characters are allowed!");
    return;
  }

  // otherwise, check if the new game name exists in the database
  let query = db.prepare("SELECT name FROM games").pluck(true).all();
  let test = query.some((rs) => rs == gamename);

  if (test) {
    // if the join gamename doesn't exist in the database, update it
    let update = db.prepare(
      "UPDATE games SET redstatus = (?), live = true WHERE name = (?)"
    );
    update.run(socket.id, gamename);
    socket.join(gamename);
    socket.emit("joingame", gamename);
    io.emit("gamelistupdate", gamelist());
    io.to(gamename).emit("startgame");
  } else {
    // otherwise notify the player that it is already in use;
    socket.emit("error", "Game name does not exist!");
  }
}

function endgame(socket) {
  let query =
    "SELECT * FROM games WHERE bluestatus = '" +
    socket.id +
    "' OR redstatus = '" +
    socket.id +
    "'";

  let data = db.prepare(query).all();

  if (data.length > 0) {
    let room = data[0].name;
    // delete the room record from the database
    let DELETE = "DELETE FROM games WHERE name = '" + data[0].name + "'";
    let deleterecord = db.prepare(DELETE);
    deleterecord.run();

    io.emit("gamelistupdate", gamelist());

    // notify users the game has ended, and leave the socket.io room
    io.to(room).emit("gameover", "Game over, your opponent has left.");
    io.in(room).socketsLeave([room]);
  }
}

function leaveroom(socket, room) {
  socket.leave(room);
}

function latency(time, socket) {
  socket.emit("latency", time);
}

io.on("connection", (socket) => {
  newconnection(socket);

  socket.on("newgame", (gamename) => {
    newgame(gamename, socket);
  });

  socket.on("joingame", (gamename) => {
    joingame(gamename, socket);
  });

  socket.on("disconnect", () => {
    endgame(socket);
  });

  socket.on("leaveroom", (room) => {
    leaveroom(socket, room);
  });

  socket.on("latency", (time) => {
    latency(time, socket);
  });
});
