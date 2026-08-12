const express = require("express");
const auth = require("../middleware/auth");
const ChatMessage = require("../models/ChatMessage");
const { findMemberRoom } = require("../services/roomAccess");

const router = express.Router();

router.get("/:roomId", auth, async (req, res) => {
  try {
    const room = await findMemberRoom(req.params.roomId, req.user._id);
    if (!room) {
      return res.status(403).json({ message: "You are not authorized for this room" });
    }

    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({
      messages: messages.map((message) => ({
        id: message._id,
        roomId: message.roomId,
        userId: message.userId,
        username: message.userName,
        text: message.message,
        timestamp: message.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load chat history" });
  }
});

module.exports = router;
