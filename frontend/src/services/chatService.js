import { apiFetch } from "./http.js";

export function getChatHistory(roomId) {
  return apiFetch(`/api/chat/${encodeURIComponent(roomId)}`);
}
