import { Server, Socket } from "socket.io";
import { jwtHelper } from "../shared/util/jwtHelper";
import config from "../config";
import { Secret } from "jsonwebtoken";
import { messageSocketHandlers } from "../modules/message/message.socket";

interface ISocketUser {
  userId: string;
  socketId: string;
}

interface IAuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    userType?: string;
    email?: string;
  };
}

// Store online users with their socket IDs
export const onlineUsers = new Map<string, ISocketUser>();

const socketInit = (io: Server) => {
  // Middleware for authentication
  io.use((socket: IAuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Remove 'Bearer ' prefix if present
      const actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;

      // Verify token
      const decoded = jwtHelper.verifyToken(
        actualToken,
        config.jwt.jwt_secret as Secret
      );

      // Attach user data to socket
      socket.data.userId = decoded.userId;
      socket.data.userType = decoded.userType;
      socket.data.email = decoded.email;

      next();
    } catch (error: any) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket: IAuthenticatedSocket) => {
    const userId = socket.data.userId;

    if (!userId) {
      console.error("Socket connected without userId");
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // Add user to online users
    onlineUsers.set(socket.id, {
      userId,
      socketId: socket.id,
    });

    // Notify user they're online
    socket.emit("connected", {
      success: true,
      userId,
      socketId: socket.id,
      message: "Connected successfully",
    });

    // Broadcast to other users that this user is now online
    socket.broadcast.emit("user_online", {
      userId,
    });

    // Register message socket handlers
    messageSocketHandlers(socket, io, onlineUsers);

    // Handle errors
    socket.on("error", (error: Error) => {
      console.error(`Socket error for user ${userId}:`, error.message);
      socket.emit("error", {
        message: error.message || "An error occurred",
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      console.log(`❌ User disconnected: ${userId} (Reason: ${reason})`);

      // Remove user from online users
      onlineUsers.delete(socket.id);

      // Broadcast to other users that this user is now offline
      socket.broadcast.emit("user_offline", {
        userId,
      });
    });

    // Handle manual disconnect request
    socket.on("manual_disconnect", () => {
      console.log(`🔌 User manually disconnected: ${userId}`);
      socket.disconnect();
    });

    // Ping-pong for connection health check
    socket.on("ping", (callback?: Function) => {
      if (callback) {
        callback({ pong: true, timestamp: Date.now() });
      } else {
        socket.emit("pong", { timestamp: Date.now() });
      }
    });

    // Get online users
    socket.on("get_online_users", (callback?: Function) => {
      const onlineUserIds = Array.from(onlineUsers.values()).map(
        (user) => user.userId
      );

      const response = {
        success: true,
        onlineUsers: onlineUserIds,
        count: onlineUserIds.length,
      };

      if (callback) {
        callback(response);
      } else {
        socket.emit("online_users", response);
      }
    });
  });

  // Handle global errors
  io.engine.on("connection_error", (err: any) => {
    console.error("Socket.IO connection error:", {
      message: err.message,
      code: err.code,
      context: err.context,
    });
  });

  console.log("🚀 Socket.IO initialized successfully");
};

export default socketInit;
