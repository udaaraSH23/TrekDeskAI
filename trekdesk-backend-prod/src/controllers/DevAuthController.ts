/**
 * @file DevAuthController.ts
 * @description Express controller for development-only authentication bypass.
 *
 * This controller provides a simplified login flow for local development and
 * automated testing environments, allowing developers to generate valid JWTs
 * without requiring real Google OAuth interactions.
 */

import { Request, Response, NextFunction } from "express";
import { IDevAuthService } from "../interfaces/services/IDevAuthService";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { DevLoginRequestDTO } from "../dtos/DevAuthDTO";

/**
 * DevAuthController
 *
 * Orchestrates the "Dev Secret" authentication bypass.
 * Communicates with the `DevAuthService` to validate plaintext secrets and
 * return standardized authentication payloads.
 */
export class DevAuthController {
  /**
   * @param devAuthService - Injected service for dev authentication logic.
   */
  constructor(private devAuthService: IDevAuthService) {}

  /**
   * POST /api/v1/auth/dev-login
   *
   * Validates a plaintext development secret and, if correct, issues a
   * session package (User + JWT) for a pre-defined "Development Admin".
   *
   * This endpoint is meant to be consumed by the "Dev Login" button in the
   * frontend dashboard when `VITE_ENABLE_DEV_LOGIN` is true.
   *
   * @param req - Express request containing `secret` in the body.
   * @param res - Express response for sending the JWT payload.
   * @param next - Express next function for error handling.
   *
   * @throws {UnauthorizedError} if the secret is incorrect (handled in service).
   * @throws {ForbiddenError} if dev-login is disabled in the current environment.
   */
  public async devLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { secret } = req.body as DevLoginRequestDTO;

      // Delegate secret validation and token generation to the service layer
      const result = await this.devAuthService.devLogin(secret);

      // Return standardized success response
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Development Login Successful",
        result,
      );
    } catch (err) {
      // Pass any specialized errors (Forbidden, Unauthorized) to the global error handler
      next(err);
    }
  }
}
