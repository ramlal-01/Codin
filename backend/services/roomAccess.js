const Room = require("../models/Room");

async function findMemberRoom(roomId, userId) {
  const room = await Room.findOne({ roomId });
  if (!room) return null;

  const isMember = room.members.some((memberId) => memberId.toString() === userId.toString());
  return isMember ? room : null;
}

module.exports = { findMemberRoom };
