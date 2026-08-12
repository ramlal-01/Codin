import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Navbar } from "../layout/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../hooks/useSocket.js";
import Chat from "./Chat.jsx";
import CodeEditor from "./CodeEditor.jsx";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

function CollaborativeRoom({ room }) {
  const { user } = useAuth();
  const { socket, connected, socketError } = useSocket(room.roomId);
  const [code, setCode] = useState("// Start coding together!");
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState(room.language || "javascript");
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState({
    stdout: null,
    stderr: null,
    status: "",
    error: null,
    runBy: null,
  });

  useEffect(() => {
    if (!socket) return undefined;

    function handleCodeUpdate({ code: nextCode, userId, language: nextLanguage }) {
      if (userId !== socket.id) setCode(nextCode || "");
      if (nextLanguage) setLanguage(nextLanguage);
    }

    function handleLanguageUpdate({ language: nextLanguage }) {
      setLanguage(nextLanguage);
    }

    function handleRunResult(result) {
      if (result.roomId !== room.roomId) return;
      setRunning(false);
      setRunOutput({
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status,
        error: result.error || null,
        runBy: result.runBy || null,
        time: result.time || null,
        memory: result.memory || null,
      });
    }

    socket.on("code-update", handleCodeUpdate);
    socket.on("language-update", handleLanguageUpdate);
    socket.on("room-users", setUsers);
    socket.on("run-result", handleRunResult);

    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("language-update", handleLanguageUpdate);
      socket.off("room-users", setUsers);
      socket.off("run-result", handleRunResult);
    };
  }, [socket, room.roomId]);

  function handleCodeChange(value) {
    const nextCode = value || "";
    setCode(nextCode);
    if (socket && connected) socket.emit("code-change", { roomId: room.roomId, code: nextCode });
  }

  function handleLanguageChange(event) {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    if (socket && connected) socket.emit("language-change", { roomId: room.roomId, language: nextLanguage });
  }

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${room.roomId}`);
      toast.success("Room link copied");
    } catch {
      toast.error("Could not copy room link");
    }
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(room.roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Could not copy room ID");
    }
  }

  function handleRun() {
    if (!socket || !connected) return;

    setRunning(true);
    setRunOutput({ stdout: null, stderr: null, status: "Running...", error: null, runBy: user?.name });
    socket.emit("run-code", {
      roomId: room.roomId,
      language,
      sourceCode: code,
      stdin,
    });
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Live coding room</p>
            <h1 className="mt-1 font-semibold text-white">{room.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="break-all text-xs text-slate-400">Room ID: {room.roomId}</p>
              <button onClick={copyRoomId} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">
                Copy ID
              </button>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 text-sm sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button onClick={copyRoomLink} className="rounded-full border border-slate-700 px-4 py-2 hover:bg-slate-800">Copy Link</button>
            <Link to={`/room/${room.roomId}/whiteboard`} className="rounded-full border border-slate-700 px-4 py-2 hover:bg-slate-800">Whiteboard</Link>
            <select value={language} onChange={handleLanguageChange} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2">
              {languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button onClick={handleRun} disabled={!connected || running} className="rounded-full bg-cyan-400 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-300">
              {running ? "Running..." : "Run Code"}
            </button>
            <span className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} title={connected ? "Connected" : "Disconnected"} />
          </div>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {socketError && <p className="lg:col-span-2 rounded border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{socketError}</p>}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            Users:
            {users.map((item) => (
              <span key={item.socketId} className="rounded bg-slate-800 px-2 py-1 text-slate-200">{item.username}</span>
            ))}
          </div>
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            className="h-24 w-full rounded border border-slate-800 bg-slate-900 p-3 text-sm outline-none focus:border-indigo-500"
            placeholder="Input for stdin..."
          />
        </section>
        <aside className="min-w-0 space-y-4">
          <Chat socket={socket} roomId={room.roomId} />
          <div className="max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex justify-between gap-2">
              <h3 className="font-semibold">Output</h3>
              {runOutput.status && <span className="text-xs text-slate-400">{runOutput.status}</span>}
            </div>
            {runOutput.error && <p className="mb-2 text-sm text-red-300">{runOutput.error}</p>}
            {runOutput.runBy && <p className="mb-2 text-xs text-slate-500">Run by {runOutput.runBy}</p>}
            {runOutput.stdout && <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-200">{runOutput.stdout}</pre>}
            {runOutput.stderr && <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-red-300">{runOutput.stderr}</pre>}
            {runOutput.time && <p className="mt-3 text-xs text-slate-500">Time {runOutput.time}s - Memory {runOutput.memory || 0} KB</p>}
            {!runOutput.stdout && !runOutput.stderr && !runOutput.error && <p className="text-sm text-slate-500">No output yet.</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CollaborativeRoom;
