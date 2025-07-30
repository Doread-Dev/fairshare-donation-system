// socket.js – singleton socket.io client
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const WS_URL = BASE_URL.replace(/\/api$/, "");

let socket;

export const getSocket = (token) => {
  if (!socket) {
    socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
}; 