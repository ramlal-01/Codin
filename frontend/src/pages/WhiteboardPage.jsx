import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";
import WhiteboardCanvas from "../components/whiteboard/WhiteboardCanvas.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { getWhiteboard, saveWhiteboard } from "../services/whiteboardService.js";

function WhiteboardPage() {
  const { roomId } = useParams();
  const { socket, connected, socketError } = useSocket(roomId);
  const [state, setState] = useState({ strokes: [] });
  const [error, setError] = useState("");
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function loadWhiteboard() {
      try {
        const data = await getWhiteboard(roomId);
        if (active) setState(data.whiteboard?.state || { strokes: [] });
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    loadWhiteboard();
    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) return undefined;

    function handleRemoteUpdate({ state: remoteState }) {
      setState(remoteState || { strokes: [] });
    }

    socket.on("whiteboard-update", handleRemoteUpdate);
    return () => socket.off("whiteboard-update", handleRemoteUpdate);
  }, [socket]);

  function handleChange(nextState) {
    setState(nextState);
    if (socket && connected) socket.emit("whiteboard-update", { roomId, state: nextState });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveWhiteboard(roomId, nextState).catch((err) => setError(err.message));
    }, 800);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <header className="flex flex-col justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Collaborative board</p>
          <h1 className="mt-1 font-semibold text-white">Whiteboard</h1>
          <p className="break-all text-xs text-slate-400">Room {roomId} - {connected ? "Connected" : "Disconnected"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
          <Link to={`/room/${roomId}`} className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800">
            Back to Editor
          </Link>
        </div>
      </header>
      {(error || socketError) && <p className="border-b border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error || socketError}</p>}
      <WhiteboardCanvas state={state} onChange={handleChange} />
    </div>
  );
}

export default WhiteboardPage;
