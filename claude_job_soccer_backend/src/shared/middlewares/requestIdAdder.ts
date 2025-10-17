import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { requestContext } from "../logger/transport";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Use existing request ID from header or generate new one
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();

  // Attach to request object
  req.id = requestId;

  // Set response header for client tracking
  res.setHeader("X-Request-Id", requestId);

  // Store requestId in async local storage for automatic logger access
  requestContext.run({ requestId }, () => {
    next();
  });
};
