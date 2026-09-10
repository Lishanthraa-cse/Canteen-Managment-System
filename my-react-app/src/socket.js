import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;

