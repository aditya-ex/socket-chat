const express = require("express");
const socket = require("socket.io");
const {
  formatMessage,
  userJoin,
  userLeave,
  getCurrentUser,
  getRoomUsers,
} = require("./util/users");

const app = express();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server is up and running on port ${port} !`);
});

app.use(express.static("public"));

let io = socket(server);

const botname = "ADIBOT 2.o";

io.on("connection", (socket) => {
  console.log("socket connection successful", socket.id);
  socket.on("joinRoom", function ({ username, room }) {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(botname, "welcom to socket-chat"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
