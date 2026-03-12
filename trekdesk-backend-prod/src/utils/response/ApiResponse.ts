/**
 * @file ApiResponse.ts
 * @description Standardized API response formatter for TrekDesk AI.
 * This class ensures that all success responses share a consistent JSON structure across the entire application.
 */

import { Response } from "express";
import { HttpStatus } from "../httpStatusCodes";

/**
 * Utility class to provide static methods for sending standardized HTTP responses.
 */
export class ApiResponse {
  /**
   * Sends a standardized success payload to the client.
   *
   * @param res - The Express Response object
   * @param statusCode - The HTTP status code (defaults to 200 OK)
   * @param message - A brief human-readable message describing the outcome
   * @param data - The main payload/results being returned (optional)
   * @param meta - Supplemental information like pagination details or analytics (optional)
   *
   * @example
   * ApiResponse.sendSuccess(res, HttpStatus.OK, "Trek detail retrieved successfully", trekData);
   */
  public static sendSuccess(
    res: Response,
    statusCode: number = HttpStatus.OK,
    message: string = "Success",
    data: unknown = null,
    meta?: unknown,
  ): void {
    const response: Record<string, unknown> = {
      status: "success",
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    res.status(statusCode).json(response);
  }
}
