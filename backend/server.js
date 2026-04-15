const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');


const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(","),
  credentials: true
}));


const JUDGE0_BASE_URL = process.env.SANDBOX_BASE_URL || 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.SANDBOX_API_KEY || '';

// Map from your dropdown values to Judge0 language IDs
// IDs from Judge0 docs (can be adjusted/extended later).[web:36]
const languageMap = {
  javascript: 63, // Node.js
  typescript: 93, // Node.js (TypeScript)
  python: 71,     // Python 3
  java: 62,       // Java (OpenJDK)
  cpp: 54,        // C++ (GCC)
  c: 50,          // C (GCC)
  html: 63,       // Often run as JS, or handle separately later
  css: 63,        // Same note as html
};


const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(","),
    methods: ["GET", "POST"],
    credentials: true    
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


  socket.on('run-code', async ({ roomId, language, sourceCode, stdin, runBy }) => {
    try {
      const languageId = languageMap[language];
      if (!languageId) {
        io.to(roomId).emit('run-result', {
          roomId,
          language,
          sourceCode,
          stdin,
          stdout: null,
          stderr: null,
          status: 'Error',
          error: `Unsupported language: ${language}`,
          runBy,
        });
        return;
      }

      const payload = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || '',
      };

      const headers = {};
      if (JUDGE0_API_KEY) {
        headers['X-Auth-Token'] = JUDGE0_API_KEY;
      }

      // Synchronous submission: wait=true so we get result in one call.[web:36]
      const response = await axios.post(
        `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
        payload,
        { headers }
      );

      const data = response.data;

      io.to(roomId).emit('run-result', {
        roomId,
        language,
        sourceCode,
        stdin,
        stdout: data.stdout,
        stderr: data.stderr,
        status: data.status?.description || 'Unknown',
        time: data.time || null,
        memory: data.memory || null,
        error: null,
        runBy,
      });
    } catch (err) {
      console.error('Error calling sandbox:', err.message);

      io.to(roomId).emit('run-result', {
        roomId,
        language,
        sourceCode,
        stdin,
        stdout: null,
        stderr: null,
        status: 'Error',
        error: 'Sandbox service unavailable',
        runBy,
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
