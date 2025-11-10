import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  const base = import.meta.env.VITE_APP_URL_API || "http://localhost:8080";
  const token = localStorage.getItem("auth_token") || "";
  socket = io(base, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err.message || err);
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  if (!socket) throw new Error("Socket not connected. Call connectSocket() first.");
  return socket;
}