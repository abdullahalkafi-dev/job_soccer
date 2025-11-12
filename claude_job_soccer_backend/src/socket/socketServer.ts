import { createServer, Server as HttpServer } from "http";
import { Server } from "socket.io";
import socketInit from "./socketInit";
import app from "../app";
import config from "../config";

export let io: Server;

const socketServer = (): HttpServer => {
  const httpServer = createServer(app);
  
  // Initialize Socket.IO with proper configuration
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    connectTimeout: 45000, // 45 seconds
    maxHttpBufferSize: 1e6, // 1 MB
    transports: ["websocket", "polling"],
    allowEIO3: true, // Allow Engine.IO v3 clients
  });

  // Initialize socket handlers
  socketInit(io);
  
  return httpServer;
};

export default socketServer;
