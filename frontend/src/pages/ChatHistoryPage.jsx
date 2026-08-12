import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";
import { getChatHistory } from "../services/chatService.js";

function ChatHistoryPage() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMessages() {
      try {
        const data = await getChatHistory(roomId);
        if (active) setMessages(data.messages || []);
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    loadMessages();
    return () => {
      active = false;
    };
  }, [roomId]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Saved conversation</p>
            <h1 className="text-2xl font-bold text-white">Chat History</h1>
            <p className="break-all text-sm text-slate-400">Room {roomId}</p>
          </div>
          <Link to={`/room/${roomId}`} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300">
            Open Room
          </Link>
        </div>
        {error && <p className="rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">No messages saved for this room.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="font-semibold text-cyan-300">{message.username}</span>
                    <span className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 break-words text-sm text-slate-300">{message.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ChatHistoryPage;
