const chatForm = document.querySelector("#chat-form");
const chatMessageDiv = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const usersUl = document.querySelector("#users");

// Get username and room from url using qs library
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// socket.io
const socket = io();

// join chat room
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  usersUl.innerHTML = `
		${users.map((user) => `<li>${user.username}</li>`).join("")}
	`;
}

// emit the messages from the server
socket.on("message", (msg) => {
  // Output message from server to the DOM
  outputMessage(msg);

  // scroll to the bottom of the div when a new message is added smoothly;
  chatMessageDiv.scrollTop = chatMessageDiv.scrollHeight;
});

//Submit message from the form
chatForm.addEventListener("submit", (e) => {
  // prevent the default behavior of the form
  e.preventDefault();

  // Get message text
  const inputField = document.querySelector("#msg");
  const message = inputField.value;

  // emit the message to the server
  socket.emit("chatMessage", message);

  // clear the input field
  inputField.value = "";

  // focus on the input field
  inputField.focus();
});

// Output message to the DOM
function outputMessage(message) {
  // Create a div
  const div = document.createElement("div");
  // Add class
  div.classList.add("message");
  // Add text
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
	${message.text}
	</p>`;
  chatMessageDiv.appendChild(div);
}
