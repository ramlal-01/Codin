import { apiFetch } from "./http.js";

export function getWhiteboard(roomId) {
  return apiFetch(`/api/whiteboards/${encodeURIComponent(roomId)}`);
}

export function saveWhiteboard(roomId, state) {
  return apiFetch(`/api/whiteboards/${encodeURIComponent(roomId)}`, {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}
