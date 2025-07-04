import { io } from 'socket.io-client';

// Use your deployed Render backend URL here
const socket = io("https://chatapp-backend.onrender.com", {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;
