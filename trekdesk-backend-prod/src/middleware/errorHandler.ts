import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError";
import { HttpStatus } from "../utils/httpStatusCodes";
import { logger } from "../utils/logger";

/**
 * Global Error Handling Middleware.
 * Acts as the final catch-all sink for exceptions thrown by any route or middleware.
 *
 * Production vs Development behavior:
 * - Operational errors (instances of AppError, like 404 NotFound or 400 BadRequest) are safely returned to the client.
 * - Unexpected bugs (internal server errors) trigger a 500 response.
 * - Stack traces are strictly stripped in `production` to prevent leaking sensitive infrastructure logic, but remain visible in dev/test for debugging.
 *
 * @param err - The Error object potentially passed down via `next(err)`.
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction (unused here, but required by Express error handler signature).
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let isOperational = false;

  // Determine if this is a known, handled error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error (in production, you might want to send this to Sentry/Datadog)
  if (!isOperational || process.env.NODE_ENV !== "production") {
    logger.error(`[Error] ${statusCode} - ${err.message}`, {
      stack: err.stack,
    });
  }

  // Construct standardized error payload
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // Only leak stack traces in non-production environments
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
