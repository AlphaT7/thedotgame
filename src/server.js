const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(3000);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("test", (details) => {
    console.log(details);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
