const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    state: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ strokes: [] }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Whiteboard", whiteboardSchema);
