require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const router = require('./Router/router');
const { injectIO, setUserSockets } = require('./Controller/messageController');
require('./DB/connection');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('./Uploads'));
app.use(router);

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }, // Added DELETE method for completeness
});

const users = {};
injectIO(io);
setUserSockets(users);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('register_user', (userId) => {
    if (userId) {
      users[userId] = socket.id;
      socket.join(userId); // Join user-specific room
      console.log(`User ${userId} registered with socket ${socket.id}`);
    } else {
      console.log('Invalid userId received:', userId);
    }
  });

  socket.on('send_message', (message) => {
    const { sender, receiver, content, timestamp, _id } = message; // Added _id to include message ID
    if (receiver && users[receiver]) {
      // Emit to receiver
      io.to(users[receiver]).emit('receive_message', {
        sender,
        receiver,
        content,
        timestamp,
        _id, // Include message ID
      });
      // Emit to sender (to update their own chat)
      if (users[sender]) {
        io.to(users[sender]).emit('receive_message', {
          sender,
          receiver,
          content,
          timestamp,
          _id, // Include message ID
        });
      }
      console.log(`Message sent from ${sender} to ${receiver} with ID ${_id}`);
    } else {
      console.log(`Receiver ${receiver} not found or offline`);
    }
  });

  // Handle message deletion
  socket.on('message_deleted', ({ messageId, receiver }) => {
    if (receiver && users[receiver]) {
      // Notify receiver of deleted message
      io.to(users[receiver]).emit('message_deleted', { messageId });
      console.log(`Message ${messageId} deletion notified to ${receiver}`);
    }
    // Notify sender as well (in case they have multiple devices)
    const senderSocketId = socket.id;
    const senderId = Object.keys(users).find((key) => users[key] === senderSocketId);
    if (senderId && users[senderId]) {
      io.to(users[senderId]).emit('message_deleted', { messageId });
      console.log(`Message ${messageId} deletion notified to sender ${senderId}`);
    }
  });

  socket.on('disconnect', () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));