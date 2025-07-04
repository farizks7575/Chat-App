import { io } from 'socket.io-client';

// Use your deployed Render backend URL here
const socket = io("https://chat-app-zvew.onrender.com", {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;
