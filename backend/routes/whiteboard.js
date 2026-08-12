const express = require("express");
const auth = require("../middleware/auth");
const Whiteboard = require("../models/Whiteboard");
const { findMemberRoom } = require("../services/roomAccess");

const router = express.Router();

router.get("/:roomId", auth, async (req, res) => {
  try {
    const room = await findMemberRoom(req.params.roomId, req.user._id);
    if (!room) {
      return res.status(403).json({ message: "You are not authorized for this room" });
    }

    const whiteboard = await Whiteboard.findOne({ roomId: req.params.roomId });
    res.json({
      whiteboard: whiteboard || {
        roomId: req.params.roomId,
        ownerId: room.owner,
        state: { strokes: [] },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load whiteboard" });
  }
});

router.put("/:roomId", auth, async (req, res) => {
  try {
    const room = await findMemberRoom(req.params.roomId, req.user._id);
    if (!room) {
      return res.status(403).json({ message: "You are not authorized for this room" });
    }

    const whiteboard = await Whiteboard.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        roomId: req.params.roomId,
        ownerId: room.owner,
        state: req.body.state || { strokes: [] },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ whiteboard });
  } catch (error) {
    res.status(500).json({ message: "Could not save whiteboard" });
  }
});

module.exports = router;
