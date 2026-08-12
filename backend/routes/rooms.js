const crypto = require("crypto");
const express = require("express");
const auth = require("../middleware/auth");
const Room = require("../models/Room");
const ChatMessage = require("../models/ChatMessage");
const Whiteboard = require("../models/Whiteboard");

const router = express.Router();

function serializeRoom(room) {
  return {
    id: room._id,
    roomId: room.roomId,
    name: room.name,
    owner: room.owner,
    members: room.members,
    language: room.language,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    lastActivityAt: room.lastActivityAt,
  };
}

function makeRoomId() {
  return crypto.randomBytes(4).toString("hex");
}

router.get("/", auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id }).sort({ lastActivityAt: -1 });
    const roomIds = rooms.map((room) => room.roomId);
    const chatCounts = await ChatMessage.aggregate([
      { $match: { roomId: { $in: roomIds } } },
      { $group: { _id: "$roomId", count: { $sum: 1 }, latest: { $max: "$createdAt" } } },
    ]);
    const whiteboards = await Whiteboard.find({ roomId: { $in: roomIds } }).select("roomId updatedAt");

    res.json({
      rooms: rooms.map(serializeRoom),
      chatSummaries: chatCounts,
      whiteboards,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load rooms" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const name = req.body.name?.trim() || "Untitled Room";
    const requestedRoomId = req.body.roomId?.trim();
    let roomId = requestedRoomId || makeRoomId();

    while (await Room.exists({ roomId })) {
      if (requestedRoomId) {
        return res.status(409).json({ message: "Room ID is already in use" });
      }
      roomId = makeRoomId();
    }

    const room = await Room.create({
      roomId,
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ room: serializeRoom(room) });
  } catch (error) {
    res.status(500).json({ message: "Could not create room" });
  }
});

router.post("/join", auth, async (req, res) => {
  try {
    const roomId = req.body.roomId?.trim();
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const alreadyMember = room.members.some((memberId) => memberId.toString() === req.user._id.toString());
    if (!alreadyMember) {
      room.members.push(req.user._id);
    }
    room.lastActivityAt = new Date();
    await room.save();

    res.json({ room: serializeRoom(room) });
  } catch (error) {
    res.status(500).json({ message: "Could not join room" });
  }
});

router.get("/:roomId", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMember = room.members.some((memberId) => memberId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    res.json({ room: serializeRoom(room) });
  } catch (error) {
    res.status(500).json({ message: "Could not load room" });
  }
});

module.exports = router;
