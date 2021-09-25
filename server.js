const mongoose = require("mongoose");
const express = require("express");
const socket = require("socket.io");
const {
  formatMessage,
  userJoin,
  userLeave,
  getCurrentUser,
  getRoomUsers,
  getUserByUsername,
} = require("./util/users");
const User = require("./models");
require("dotenv").config();

const app = express();

const db = process.env.URI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(express.json());

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server is up and running on port ${port} !`);
});

app.use(express.static("public"));

let io = socket(server);

const botname = "ADIBOT 2.o";

io.on("connection", (socket) => {
  console.log("socket connection successful", socket.id);
  socket.on("joinRoom", async function ({ username, room }) {
    const user = userJoin(socket.id, username, room);
    let profile = User();
    profile.socket_id = socket.id;
    profile.username = username;
    profile.room = room;
    await profile.save();
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
  socket.on("receiver", async ({ receiver, data }) => {
    let user = await getUserByUsername(receiver);
    // console.log(user.id, data);
    io.to(user.id).emit("notification", data);
  });
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", async () => {
    const user = userLeave(socket.id);
    await User.deleteOne({ socket_id: socket.id });
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
