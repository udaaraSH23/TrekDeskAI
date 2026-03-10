/**
 * @file httpStatusCodes.ts
 * @description Centralized repository for common HTTP status codes.
 * This ensures consistency across the application and eliminates the use of 'magic numbers'.
 */

/**
 * Common HTTP Status Codes used across the TrekDesk AI API.
 */
export enum HttpStatus {
  /** Request succeeded (200) */
  OK = 200,
  /** Resource successfully created (201) */
  CREATED = 201,
  /** Request accepted for processing (202) */
  ACCEPTED = 202,
  /** Request succeeded with no content returned (204) */
  NO_CONTENT = 204,

  /** General client-side error (400) */
  BAD_REQUEST = 400,
  /** Missing or invalid authentication token (401) */
  UNAUTHORIZED = 401,
  /** Authenticated but lacking necessary permissions (403) */
  FORBIDDEN = 403,
  /** Resource requested could not be found (404) */
  NOT_FOUND = 404,
  /** Request conflicts with existing state of the resource (409) */
  CONFLICT = 409,
  /** Server understood request but can't process it (e.g. invalid file type) (422) */
  UNPROCESSABLE_ENTITY = 422,

  /** Generic unexpected server error (500) */
  INTERNAL_SERVER_ERROR = 500,
  /** Server does not support the functionality required to fulfill the request (501) */
  NOT_IMPLEMENTED = 501,
  /** Server acting as gateway received invalid response from upstream (502) */
  BAD_GATEWAY = 502,
  /** Server is temporarily unable to handle the request (503) */
  SERVICE_UNAVAILABLE = 503,
}
