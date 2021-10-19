const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");
const formatMessage = require("./utils/messages");

// middleware for express
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// bot name
const botName = "Wizzytech";
// socket connection
io.on("connection", (socket) => {
  // join user to a room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Send to the single client who is connected //welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to the chat app"));

    //Broadcast when a user connects // welcome current user
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chart`)
      );

    //Send users and room info to the client
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Runs when the client disconnets
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //Send users and room info to the client
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  // Listen for new message
  socket.on("chatMessage", (chatMessage) => {
    const user = getCurrentUser(socket.id);
    // Send to everyone
    io.to(user.room).emit("message", formatMessage(user.username, chatMessage));
  });
});

// port and listen to
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Listening on port ${port}`));
