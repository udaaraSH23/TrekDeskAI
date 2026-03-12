/**
 * @file api.types.ts
 * @description Shared envelope types that mirror the backend's standardized HTTP response format.
 *
 * All backend responses follow one of two shapes:
 *  - Success: `{ status: "success", statusCode, message, data: T }`
 *  - Error:   `{ status: "error",   statusCode, message }`
 *
 * Having these types here means every service function can be properly typed
 * end-to-end, and the `ApiError` class can be matched against `ApiErrorResponse`
 * when wrapping Axios errors in the response interceptor.
 */

/**
 * The standard success response envelope returned by every backend endpoint.
 * @template T - The shape of the `data` payload.
 */
export interface ApiSuccessResponse<T> {
  status: "success";
  statusCode: number;
  message: string;
  data: T;
}

/**
 * The standard error response envelope returned by the backend's global error handler.
 * Maps directly to the `errorHandler.ts` middleware output.
 */
export interface ApiErrorResponse {
  status: "error";
  statusCode: number;
  message: string;
  /** Stack trace — only present in non-production environments */
  stack?: string;
}
