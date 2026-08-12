import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createRoom, getRooms, joinRoom } from "../services/roomService.js";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [chatSummaries, setChatSummaries] = useState([]);
  const [whiteboards, setWhiteboards] = useState([]);
  const [createName, setCreateName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const whiteboardRoomIds = useMemo(() => new Set(whiteboards.map((item) => item.roomId)), [whiteboards]);
  const latestRoom = rooms[0];

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await getRooms();
      setRooms(data.rooms || []);
      setChatSummaries(data.chatSummaries || []);
      setWhiteboards(data.whiteboards || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await createRoom({ name: createName || "Untitled Room" });
      navigate(`/room/${data.room.roomId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await joinRoom(joinId);
      navigate(`/room/${data.room.roomId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-6 overflow-hidden rounded-2xl border border-cyan-400/15 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Workspace</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Welcome back, {user?.name || "coder"}.</h1>
              <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-400">
                Manage your rooms, reopen saved chats, and continue whiteboards from one place.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-2xl font-bold text-white">{rooms.length}</p>
                <p className="text-slate-500">Rooms</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-2xl font-bold text-white">{chatSummaries.length}</p>
                <p className="text-slate-500">Chats</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-2xl font-bold text-white">{whiteboards.length}</p>
                <p className="text-slate-500">Boards</p>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="mb-4 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
          <form id="create-room" onSubmit={handleCreate} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold text-white">Create Room</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Give it a readable name. CodIn generates the room ID for sharing.</p>
            <input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="Example: DSA mock interview"
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <button className="mt-3 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300">
              Create Room
            </button>
          </form>

          <form onSubmit={handleJoin} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold text-white">Join Room</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Paste the shared room ID. This is different from your login email or name.</p>
            <input
              value={joinId}
              onChange={(event) => setJoinId(event.target.value)}
              placeholder="Example: 7f3a91c2"
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              required
            />
            <button className="mt-3 w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-600">
              Join Room
            </button>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold text-white">Continue Fast</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Jump back into your latest activity.</p>
            {latestRoom ? (
              <Link to={`/room/${latestRoom.roomId}`} className="mt-4 block rounded-xl border border-cyan-400/25 bg-cyan-950/30 p-4 transition hover:bg-cyan-950/50">
                <p className="font-semibold text-cyan-100">{latestRoom.name}</p>
                <p className="mt-1 break-all text-xs text-cyan-300">Room {latestRoom.roomId}</p>
              </Link>
            ) : (
              <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">Create a room to start collaborating.</p>
            )}
          </div>
        </section>

        <section id="rooms" className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">My Rooms</h2>
            <span className="text-sm text-slate-500">{rooms.length} total</span>
          </div>
          {loading ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">No rooms yet. Create one above to begin.</p>
          ) : (
            <div className="grid gap-3">
              {rooms.map((room) => (
                <article key={room.roomId} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-400/30">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white">{room.name}</h3>
                      <p className="mt-1 break-all text-sm text-slate-400">
                        Room {room.roomId} - Last active {new Date(room.lastActivityAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Link to={`/room/${room.roomId}`} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300">Open</Link>
                      <Link to={`/chat/${room.roomId}`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Chat</Link>
                      <Link to={`/room/${room.roomId}/whiteboard`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
                        {whiteboardRoomIds.has(room.roomId) ? "Whiteboard" : "New Board"}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Saved Conversations</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              {chatSummaries.length === 0 ? (
                <p className="text-sm text-slate-400">No saved messages yet.</p>
              ) : (
                chatSummaries.map((chat) => (
                  <Link key={chat._id} to={`/chat/${chat._id}`} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">
                    Room {chat._id} - {chat.count} messages
                  </Link>
                ))
              )}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Saved Whiteboards</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              {whiteboards.length === 0 ? (
                <p className="text-sm text-slate-400">No saved whiteboards yet.</p>
              ) : (
                whiteboards.map((board) => (
                  <Link key={board.roomId} to={`/room/${board.roomId}/whiteboard`} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">
                    Room {board.roomId} - Updated {new Date(board.updatedAt).toLocaleString()}
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
