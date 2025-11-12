import { Socket } from "socket.io";

export enum SocketErrorCode {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BLOCKED_USER = "BLOCKED_USER",
  RATE_LIMIT = "RATE_LIMIT",
}

export interface ISocketError {
  code: SocketErrorCode;
  message: string;
  details?: any;
  timestamp: number;
}

export class SocketError extends Error {
  code: SocketErrorCode;
  details?: any;

  constructor(code: SocketErrorCode, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "SocketError";
  }
}

export const handleSocketError = (
  socket: Socket,
  error: any,
  event?: string
): ISocketError => {
  console.error(`Socket error${event ? ` in ${event}` : ""}:`, {
    message: error.message,
    stack: error.stack,
    userId: (socket as any).data?.userId,
    socketId: socket.id,
  });

  let socketError: ISocketError;

  if (error instanceof SocketError) {
    socketError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: Date.now(),
    };
  } else if (error.name === "ValidationError") {
    socketError = {
      code: SocketErrorCode.VALIDATION_ERROR,
      message: error.message || "Validation error",
      details: error.details || error.errors,
      timestamp: Date.now(),
    };
  } else if (error.statusCode === 401 || error.message.includes("Unauthorized")) {
    socketError = {
      code: SocketErrorCode.AUTHENTICATION_ERROR,
      message: "Authentication failed",
      timestamp: Date.now(),
    };
  } else if (error.statusCode === 403 || error.message.includes("Forbidden")) {
    socketError = {
      code: SocketErrorCode.FORBIDDEN,
      message: error.message || "Access forbidden",
      timestamp: Date.now(),
    };
  } else if (error.statusCode === 404 || error.message.includes("not found")) {
    socketError = {
      code: SocketErrorCode.NOT_FOUND,
      message: error.message || "Resource not found",
      timestamp: Date.now(),
    };
  } else if (error.message.includes("block")) {
    socketError = {
      code: SocketErrorCode.BLOCKED_USER,
      message: error.message || "User is blocked",
      timestamp: Date.now(),
    };
  } else {
    socketError = {
      code: SocketErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred",
      timestamp: Date.now(),
    };
  }

  return socketError;
};

export const emitError = (
  socket: Socket,
  error: any,
  event?: string
): void => {
  const socketError = handleSocketError(socket, error, event);
  socket.emit("error", socketError);
};

export const validateSocketPayload = (
  payload: any,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(
    (field) => !payload || payload[field] === undefined || payload[field] === null
  );

  if (missingFields.length > 0) {
    throw new SocketError(
      SocketErrorCode.VALIDATION_ERROR,
      `Missing required fields: ${missingFields.join(", ")}`,
      { missingFields }
    );
  }
};
