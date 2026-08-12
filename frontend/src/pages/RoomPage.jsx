import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CollaborativeRoom from "../components/room/CollaborativeRoom.jsx";
import { getRoom } from "../services/roomService.js";

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRoom() {
      try {
        const data = await getRoom(roomId);
        if (active) setRoom(data.room);
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    loadRoom();
    return () => {
      active = false;
    };
  }, [roomId]);

  if (error) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-100">{error}</div>;
  }

  if (!room) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-100">Loading room...</div>;
  }

  return <CollaborativeRoom room={room} />;
}

export default RoomPage;
