import { apiFetch } from "./http.js";

export function getRooms() {
  return apiFetch("/api/rooms");
}

export function getRoom(roomId) {
  return apiFetch(`/api/rooms/${encodeURIComponent(roomId)}`);
}

export function createRoom(payload) {
  return apiFetch("/api/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinRoom(roomId) {
  return apiFetch("/api/rooms/join", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  });
}
