/**
 * @file ApiError.test.ts
 * @description Unit tests for the `ApiError` class.
 *
 * Verifies:
 *  1. ApiError is a proper Error subclass (instanceof chain works)
 *  2. statusCode and message are set correctly
 *  3. isOperational correctly classifies 4xx vs 5xx
 *  4. The error name is 'ApiError' (not 'Error'), aiding in debugging
 *  5. Prototype chain is properly restored (required for TS built-in extension)
 *  6. ErrorBoundary compatibility — the error's message is human-readable
 */

import { describe, it, expect } from "vitest";
import { ApiError } from "../../lib/errors/ApiError";

describe("ApiError", () => {
  // ─── Inheritance & Prototype Chain ─────────────────────────────────────

  it("should be an instance of Error (built-in)", () => {
    const err = new ApiError(400, "Bad Request");
    expect(err).toBeInstanceOf(Error);
  });

  it("should be an instance of ApiError", () => {
    const err = new ApiError(404, "Not Found");
    expect(err).toBeInstanceOf(ApiError);
  });

  it('should have name set to "ApiError" (not "Error")', () => {
    const err = new ApiError(401, "Unauthorized");
    expect(err.name).toBe("ApiError");
  });

  // ─── Message ───────────────────────────────────────────────────────────

  it("should set the message property correctly", () => {
    const message = "Invalid Google ID token";
    const err = new ApiError(401, message);
    expect(err.message).toBe(message);
  });

  it("should expose message for ErrorBoundary to render", () => {
    const backendMessage = "Trek name must be at least 3 characters";
    const err = new ApiError(400, backendMessage);
    // ErrorBoundary renders: this.state.error?.message
    // This test verifies that message is never undefined or empty
    expect(err.message).toBeTruthy();
    expect(err.message).toBe(backendMessage);
  });

  // ─── Status Code ────────────────────────────────────────────────────────

  it("should set statusCode correctly for a 400 error", () => {
    const err = new ApiError(400, "Validation failed");
    expect(err.statusCode).toBe(400);
  });

  it("should set statusCode correctly for a 404 error", () => {
    const err = new ApiError(404, "Resource not found");
    expect(err.statusCode).toBe(404);
  });

  it("should set statusCode correctly for a 500 error", () => {
    const err = new ApiError(500, "Internal Server Error");
    expect(err.statusCode).toBe(500);
  });

  // ─── isOperational Classification ──────────────────────────────────────

  it("should be operational for a 400 Bad Request (user can act on it)", () => {
    const err = new ApiError(400, "Invalid input");
    expect(err.isOperational).toBe(true);
  });

  it("should be operational for a 401 Unauthorized (user can re-login)", () => {
    const err = new ApiError(401, "Session expired");
    expect(err.isOperational).toBe(true);
  });

  it("should be operational for a 403 Forbidden", () => {
    const err = new ApiError(403, "Access denied");
    expect(err.isOperational).toBe(true);
  });

  it("should be operational for a 404 Not Found", () => {
    const err = new ApiError(404, "Trek not found");
    expect(err.isOperational).toBe(true);
  });

  it("should be operational for a 422 Unprocessable Entity", () => {
    const err = new ApiError(422, "Unprocessable entity");
    expect(err.isOperational).toBe(true);
  });

  it("should NOT be operational for a 500 Internal Server Error (server bug)", () => {
    const err = new ApiError(500, "Database connection failed");
    expect(err.isOperational).toBe(false);
  });

  it("should NOT be operational for a 502 Bad Gateway", () => {
    const err = new ApiError(502, "Bad gateway");
    expect(err.isOperational).toBe(false);
  });

  it("should NOT be operational for a 503 Service Unavailable", () => {
    const err = new ApiError(503, "Service unavailable");
    expect(err.isOperational).toBe(false);
  });

  // ─── Edge Cases ─────────────────────────────────────────────────────────

  it("should allow catching as a generic Error", () => {
    const throwApiError = () => {
      throw new ApiError(400, "Caught as generic error");
    };
    expect(throwApiError).toThrow(Error);
    expect(throwApiError).toThrow("Caught as generic error");
  });

  it("should allow catching as ApiError specifically", () => {
    try {
      throw new ApiError(404, "Trek not found");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      if (err instanceof ApiError) {
        expect(err.statusCode).toBe(404);
        expect(err.isOperational).toBe(true);
      }
    }
  });
});
