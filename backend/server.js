const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];


const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', (roomId, username) => {
    socket.join(roomId);  // ← CRITICAL: Joins Socket.io room
    console.log(`${username} joined room: ${roomId}`);
    
    socket.to(roomId).emit('user-joined', { username });
  });


  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', { code, userId: socket.id })
  })

  socket.on('chat-message', ({ roomId, message }) => {
  socket.to(roomId).emit('chat-message', message)
})

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
