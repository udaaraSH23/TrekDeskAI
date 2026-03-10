/**
 * @file AppError.ts
 * @description Base class for application-specific errors.
 * Extends the built-in Error class to include HTTP status codes and operational flags.
 */

/**
 * Centralized Application Error Class.
 * Used to distinguish between operational errors (expected) and programming errors (bugs).
 */
export class AppError extends Error {
  /** The HTTP status code associated with this error */
  public readonly statusCode: number;
  /**
   * Indicates if the error is operational (expected) or a programmer error (unexpected).
   * Operational errors are safely handled and returned to the client.
   */
  public readonly isOperational: boolean;

  /**
   * Creates an instance of AppError.
   *
   * @param statusCode - The HTTP status code to return to the client.
   * @param message - A human-readable error message describing what went wrong.
   * @param isOperational - True if this is an expected error (e.g., Validation, Not Found).
   *                        False if it represents a bug or system failure.
   */
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);

    // Restore prototype chain for extending built-in Error in TypeScript
    // This is necessary because of how TS handles extending built-in classes
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capturing stack trace, excluding the constructor call from it for cleaner logs
    Error.captureStackTrace(this, this.constructor);
  }
}
