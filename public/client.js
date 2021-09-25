const socket = io();

const text = document.getElementById("msg");
const tags = document.getElementById("tags");
const chatForm = document.getElementById("chat-form");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const chatMessages = document.querySelector(".chat-messages");
const leaveBtn = document.getElementById("leave-btn");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);
});

socket.on("notification", (data) => {
    alert(data);
})

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.innerText = message.username;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);
  chatMessages.appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

tags.addEventListener("click", async () => {
  let receiver = prompt("enter receivers username");
  let data = text.value;
//   console.log(data);
  await socket.emit("receiver", { receiver,data });
});

leaveBtn.addEventListener("click", () => {
  const leaveRoom = confirm("do you really wanna go??");
  if (leaveRoom) {
    window.location = "/index.html";
  } else {
    alert("why did you clicked that button if you are not gonna leave");
  }
});
