import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState("");

  useEffect(() => {
    if (!token || !roomId) return undefined;

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      setSocketError("");
      socketInstance.emit("join-room", { roomId });
    });

    socketInstance.on("disconnect", () => setConnected(false));
    socketInstance.on("connect_error", (error) => setSocketError(error.message || "Socket connection failed"));
    socketInstance.on("room-error", (error) => setSocketError(error.message || "Room connection failed"));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [roomId, token]);

  return { socket, connected, socketError };
}
