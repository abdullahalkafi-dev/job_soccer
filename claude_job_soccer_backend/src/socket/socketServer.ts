import { createServer } from "http";
import { Server } from "socket.io";
import socketInit from "./socketInit";
import app from "../app";

export var io: Server;
const socketServer = () => {
  const httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  socketInit(io);
  return httpServer;
};

export default socketServer;
