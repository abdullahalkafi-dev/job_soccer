import { ErrorRequestHandler, request } from "express";
import { ZodError } from "zod";

import config from "../../config";
import { TErrorSources } from "../types/error";
import handleZodError from "../../errors/handleZodError";
import handleValidationError from "../../errors/handleValidationError";
import handleCastError from "../../errors/handleCastError";
import handleDuplicateError from "../../errors/handleDuplicateError";
import AppError from "../../errors/AppError";
import { logger } from "../logger/logger";
import { requestContext } from "../logger/transport";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): any => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "ValidationError") {
    console.log(err);
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err?.message,
      },
    ];
  }
  // Log error with automatic requestId from context
  logger.error('Error occurred:', {
    message,
    errorSources,
    path: _req.path,
    method: _req.method
  });

  // Get requestId from async context
  const context = requestContext.getStore();
  const requestId = context?.requestId;

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(requestId && { requestId }), // Add requestId if available
    stack: config.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;
