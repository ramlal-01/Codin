import { useEffect, useRef, useState } from "react";
import { getChatHistory } from "../../services/chatService.js";

function Chat({ socket, roomId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const messagesRef = useRef(null);

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

  useEffect(() => {
    if (!socket) return undefined;

    function handleMessage(message) {
      setMessages((current) => {
        if (message.id && current.some((item) => item.id === message.id)) return current;
        return [...current, message];
      });
    }

    socket.on("chat-message", handleMessage);
    socket.on("chat-error", (err) => setError(err.message || "Chat failed"));

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("chat-error");
    };
  }, [socket]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(event) {
    event.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit("chat-message", { roomId, message: { text: inputText } });
    setInputText("");
  }

  return (
    <div className="flex h-[420px] flex-col rounded-lg border border-slate-800 bg-slate-900 lg:h-[560px]">
      <div className="border-b border-slate-800 p-4">
        <h3 className="font-semibold">Chat</h3>
      </div>
      <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {error && <p className="rounded bg-red-950/50 p-2 text-sm text-red-200">{error}</p>}
        {messages.map((msg, index) => (
          <div key={msg.id || index} className="text-sm">
            <div className="flex gap-2">
              <span className="font-semibold text-indigo-300">{msg.username}</span>
              <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <p className="break-words text-slate-300">{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="border-t border-slate-800 p-4">
        <input
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder="Type a message..."
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </form>
    </div>
  );
}

export default Chat;
