const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// roomId -> Map<socketId, username>
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', (roomId, username) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Map());
    }

    const usersInRoom = roomUsers.get(roomId);
    usersInRoom.set(socket.id, username);

    const currentUsers = Array.from(usersInRoom.entries()).map(
      ([socketId, name]) => ({ socketId, username: name })
    );

    io.to(roomId).emit('room-users', currentUsers);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', { code, userId: socket.id });
  });

  socket.on('chat-message', ({ roomId, message }) => {
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    for (const [roomId, usersInRoom] of roomUsers.entries()) {
      if (usersInRoom.has(socket.id)) {
        usersInRoom.delete(socket.id);

        const currentUsers = Array.from(usersInRoom.entries()).map(
          ([socketId, name]) => ({ socketId, username: name })
        );

        io.to(roomId).emit('room-users', currentUsers);

        if (usersInRoom.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
