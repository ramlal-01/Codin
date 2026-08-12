const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const chatRoutes = require("./routes/chat");
const whiteboardRoutes = require("./routes/whiteboard");
const { executeCode } = require("./services/codeExecution");
const ChatMessage = require("./models/ChatMessage");
const Room = require("./models/Room");
const User = require("./models/User");
const Whiteboard = require("./models/Whiteboard");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({ message: "CodIn backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/whiteboards", whiteboardRoutes);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const roomUsers = new Map();
const whiteboardSaveTimers = new Map();

function getRoomUsers(roomId) {
  const usersInRoom = roomUsers.get(roomId) || new Map();
  return Array.from(usersInRoom.entries()).map(([socketId, user]) => ({
    socketId,
    userId: user.userId,
    username: user.name,
  }));
}

async function ensureRoomMember(roomId, userId) {
  const room = await Room.findOne({ roomId });
  if (!room) return null;

  const isMember = room.members.some((memberId) => memberId.toString() === userId);
  if (!isMember) return null;

  room.lastActivityAt = new Date();
  await room.save();
  return room;
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) return next(new Error("Invalid user"));

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", async ({ roomId }) => {
    try {
      const room = await ensureRoomMember(roomId, socket.user.id);
      if (!room) {
        socket.emit("room-error", { message: "Room not found or unauthorized" });
        return;
      }

      socket.join(roomId);
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }

      roomUsers.get(roomId).set(socket.id, {
        userId: socket.user.id,
        name: socket.user.name,
      });

      socket.emit("code-update", {
        code: room.code || "// Start coding together!",
        language: room.language || "javascript",
        userId: "server",
      });
      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    } catch (error) {
      socket.emit("room-error", { message: "Could not join room" });
    }
  });

  socket.on("code-change", async ({ roomId, code }) => {
    const room = await ensureRoomMember(roomId, socket.user.id);
    if (!room) return;

    room.code = code || "";
    await room.save();
    socket.to(roomId).emit("code-update", { code: room.code, userId: socket.id });
  });

  socket.on("language-change", async ({ roomId, language }) => {
    const room = await ensureRoomMember(roomId, socket.user.id);
    if (!room) return;

    room.language = language || "javascript";
    await room.save();
    socket.to(roomId).emit("language-update", { language: room.language });
  });

  socket.on("chat-message", async ({ roomId, message }) => {
    try {
      const room = await ensureRoomMember(roomId, socket.user.id);
      if (!room || !message?.text?.trim()) return;

      const savedMessage = await ChatMessage.create({
        roomId,
        userId: socket.user.id,
        userName: socket.user.name,
        message: message.text.trim(),
      });

      const payload = {
        id: savedMessage._id,
        roomId,
        userId: socket.user.id,
        username: socket.user.name,
        text: savedMessage.message,
        timestamp: savedMessage.createdAt,
      };

      io.to(roomId).emit("chat-message", payload);
    } catch (error) {
      socket.emit("chat-error", { message: "Message could not be saved" });
    }
  });

  socket.on("whiteboard-update", async ({ roomId, state }) => {
    const room = await ensureRoomMember(roomId, socket.user.id);
    if (!room) return;

    socket.to(roomId).emit("whiteboard-update", { state, updatedBy: socket.user.id });

    if (whiteboardSaveTimers.has(roomId)) {
      clearTimeout(whiteboardSaveTimers.get(roomId));
    }

    whiteboardSaveTimers.set(
      roomId,
      setTimeout(async () => {
        await Whiteboard.findOneAndUpdate(
          { roomId },
          { roomId, ownerId: room.owner, state, updatedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        whiteboardSaveTimers.delete(roomId);
      }, 700)
    );
  });

  socket.on("whiteboard-clear", async ({ roomId }) => {
    const room = await ensureRoomMember(roomId, socket.user.id);
    if (!room) return;

    const state = { strokes: [] };
    await Whiteboard.findOneAndUpdate(
      { roomId },
      { roomId, ownerId: room.owner, state },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    io.to(roomId).emit("whiteboard-update", { state, updatedBy: socket.user.id });
  });

  socket.on("run-code", async ({ roomId, language, sourceCode, stdin }) => {
    try {
      const room = await ensureRoomMember(roomId, socket.user.id);
      if (!room) return;

      const result = await executeCode({ language, sourceCode, stdin });
      io.to(roomId).emit("run-result", {
        roomId,
        language,
        sourceCode,
        stdin,
        ...result,
        runBy: socket.user.name,
      });
    } catch (error) {
      io.to(roomId).emit("run-result", {
        roomId,
        language,
        sourceCode,
        stdin,
        stdout: null,
        stderr: null,
        status: "Error",
        error: error.message || "Code execution failed",
        runBy: socket.user.name,
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [roomId, usersInRoom] of roomUsers.entries()) {
      if (usersInRoom.has(socket.id)) {
        usersInRoom.delete(socket.id);
        io.to(roomId).emit("room-users", getRoomUsers(roomId));

        if (usersInRoom.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    }
  });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Database-backed routes will not work.");
  } else {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
