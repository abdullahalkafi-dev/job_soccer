import { createLogger } from "winston";
import { consoleTransport, elasticTransport, errorFileTransport, infoFileTransport, requestContext } from "./transport";
import config from "../../config";

// Only use console transport in development
const transports = config.node_env === "production" 
  ? [errorFileTransport, infoFileTransport, elasticTransport]
  : [consoleTransport, errorFileTransport, infoFileTransport, elasticTransport];

export const logger = createLogger({
  transports,
  exitOnError: false
});

// Helper function to log with a specific requestId (for non-HTTP contexts)
export const logWithRequestId = (requestId: string, level: string, message: string, meta?: any) => {
  requestContext.run({ requestId }, () => {
    (logger as any)[level](message, meta);
  });
};

