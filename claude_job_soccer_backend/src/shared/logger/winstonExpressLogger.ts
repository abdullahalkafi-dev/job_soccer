import winstonExpressLogger from "express-winston";
import { Request, Response } from "express";
import { logger } from "./logger";
import config from "../../config";

// List of sensitive fields to redact from logs
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "apiKey",
  "secret",
  "creditCard",
  "ssn",
  "apiSecret",
];

// Dynamically redact sensitive data from request body and headers
const redactSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in redacted) {
    if (redacted.hasOwnProperty(key)) {
      const lowerKey = key.toLowerCase();

      // Check if key matches sensitive field patterns
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        redacted[key] = "[REDACTED]";
      } else if (typeof redacted[key] === "object" && redacted[key] !== null) {
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    }
  }

  return redacted;
};

// Create express-winston logger  configuration
const expressWinstonLogger = (level: string) => {
  return winstonExpressLogger.logger({
    level: level || "http",
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: config.node_env === "development",

    metaField: null,
    requestWhitelist: ["url", "method", "httpVersion"],
    responseWhitelist: ["statusCode"],

    // Dynamic metadata with sensitive data redaction
    dynamicMeta: (req: Request, res: Response) => {
      return {
        requestId: req.id || req.headers["x-request-id"] || "unknown",
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        userId: (req as any).user?.id,
        ...(Object.keys(req.body || {}).length > 0 && {
          body: redactSensitiveData(req.body),
        }),
        ...(Object.keys(req.query || {}).length > 0 && {
          query: redactSensitiveData(req.query),
        }),
        ...(Object.keys(req.params || {}).length > 0 && {
          params: req.params,
        }),
      };
    },

    // Skip logging based on level and status code
    skip: (req: Request, res: Response) => {
      // Skip health checks in production
      if (config.node_env === "production" && req.url === "/health") {
        return true;
      }

      // Skip based on log level
      if (level === "error") return res.statusCode < 400;
      if (level === "info") return res.statusCode >= 400;

      return false;
    },

    // Ignore specific routes like static files
    ignoreRoute: (req: Request, _res: Response) => {
      return (
        req.url.startsWith("/uploads/") || req.url.startsWith("/favicon.ico")
      );
    },

    // Custom header blacklist - don't log sensitive headers
    headerBlacklist: ["cookie", "authorization", "x-api-key", "x-csrf-token"],

    // Custom status levels for different HTTP codes
    statusLevels: {
      success: "info",
      warn: "warn",
      error: "error",
    },
  });
};

// Error logger - logs 4xx and 5xx responses
export const errorLogger = expressWinstonLogger("error");

// Info logger - logs successful 2xx and 3xx responses
export const infoLogger = expressWinstonLogger("info");

// HTTP logger - logs all requests (optional, for debugging)
export const httpLogger = expressWinstonLogger("http");

// Combined export
const winstonLogger = {
  errorLogger,
  infoLogger,
  httpLogger,
};

export default winstonLogger;
