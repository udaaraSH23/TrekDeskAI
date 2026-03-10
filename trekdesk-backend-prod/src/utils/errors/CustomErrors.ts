/**
 * @file CustomErrors.ts
 * @description specialized error classes that extend AppError for cleaner error management.
 * These classes allow for throwing errors with pre-set HTTP status codes and default messages.
 */

import { AppError } from "./AppError";
import { HttpStatus } from "../httpStatusCodes";

/**
 * Thrown when the user provides invalid input or a malformed request (400).
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(HttpStatus.BAD_REQUEST, message, true);
  }
}

/**
 * Thrown when authentication is required and has failed or hasn't been provided (401).
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized Access") {
    super(HttpStatus.UNAUTHORIZED, message, true);
  }
}

/**
 * Thrown when the user is authenticated but does not have the necessary permissions (403).
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden Access") {
    super(HttpStatus.FORBIDDEN, message, true);
  }
}

/**
 * Thrown when the requested resource cannot be found (404).
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found") {
    super(HttpStatus.NOT_FOUND, message, true);
  }
}

/**
 * Thrown when a request conflicts with the current state of the server (409).
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource Conflict") {
    super(HttpStatus.CONFLICT, message, true);
  }
}

/**
 * Thrown when an unexpected error occurs on the server (500).
 * Note: isOperational is false for internal server errors to signal a bug.
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, false);
  }
}
