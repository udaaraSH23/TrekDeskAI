/**
 * @file ApiError.ts
 * @description Frontend counterpart to the backend's `AppError` class.
 *
 * Purpose:
 * - Gives the frontend a typed, structured error class instead of raw Axios errors.
 * - The API response interceptor (`api.ts`) wraps every non-2xx response in this class.
 * - The `ErrorBoundary` component can `instanceof ApiError` to distinguish operational
 *   API errors (404, 403, 422) from unexpected programming bugs (crashes).
 *
 * Consumer pattern:
 * ```ts
 * try {
 *   await TourService.createTour(payload);
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     // Show err.message to the user — it comes directly from the backend
 *     setError(err.message);
 *   }
 * }
 * ```
 */

/**
 * Structured error thrown by the API layer when the backend returns a non-2xx response.
 * The `message` is always extracted from `response.data.message` (the backend's envelope field),
 * never the raw Axios message, so it is always human-readable.
 */
export class ApiError extends Error {
  /** The HTTP status code returned by the backend (e.g. 400, 401, 404, 422, 500). */
  public readonly statusCode: number;

  /**
   * True for expected API errors (4xx) the user can act on.
   * False for unexpected server failures (5xx) that indicate a bug.
   * This mirrors the `isOperational` flag from the backend's `AppError`.
   */
  public readonly isOperational: boolean;

  /**
   * Creates an instance of ApiError.
   * @param statusCode - The HTTP status code (e.g., 404, 500).
   * @param message - The human-readable error message.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    // Restore the prototype chain (required when extending built-in Error in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "ApiError";
    this.statusCode = statusCode;
    // Client-side: 4xx are operational (user error), 5xx are non-operational (server bug)
    this.isOperational = statusCode >= 400 && statusCode < 500;
  }
}
