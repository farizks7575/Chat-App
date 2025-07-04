require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const router = require('./Router/router');
const { injectIO, setUserSockets } = require('./Controller/messageController');
require('./DB/connection');

const app = express();

// ✅ 1. CORS: Remove trailing slash and allow credentials (optional but safer)
app.use(cors({
  origin: 'https://candid-duckanoo-4f5524.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('./Uploads'));
app.use(router);

const server = http.createServer(app);
const { Server } = require('socket.io');

// ✅ 2. Socket.IO CORS config should match express CORS
const io = new Server(server, {
  cors: {
    origin: 'https://candid-duckanoo-4f5524.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const users = {};
injectIO(io);
setUserSockets(users);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('register_user', (userId) => {
    if (userId) {
      users[userId] = socket.id;
      socket.join(userId);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on('send_message', (message) => {
    const { sender, receiver, content, timestamp, _id } = message;
    if (receiver && users[receiver]) {
      io.to(users[receiver]).emit('receive_message', { sender, receiver, content, timestamp, _id });
      if (users[sender]) {
        io.to(users[sender]).emit('receive_message', { sender, receiver, content, timestamp, _id });
      }
    } else {
      console.log(`Receiver ${receiver} not found or offline`);
    }
  });

  socket.on('message_deleted', ({ messageId, receiver }) => {
    if (receiver && users[receiver]) {
      io.to(users[receiver]).emit('message_deleted', { messageId });
    }
    const senderSocketId = socket.id;
    const senderId = Object.keys(users).find((key) => users[key] === senderSocketId);
    if (senderId && users[senderId]) {
      io.to(users[senderId]).emit('message_deleted', { messageId });
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
