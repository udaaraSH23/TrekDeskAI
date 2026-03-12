/**
 * @file DevAuthController.ts
 * @description Controller for development-only authentication bypass logic.
 * THIS FILE SHOULD NOT BE INVOKED IN PRODUCTION ENVIRONMENTS.
 */
import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { env } from "../config/env";
import {
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { AuthUser } from "../models/auth.schema";

/**
 * Controller for generating real JWTs for a fixed "Dev User" without OAuth.
 * Restricted by environment variables and logic guards.
 */
export class DevAuthController {
  private readonly DEV_USER: AuthUser = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "dev-admin@trekdesk.ai",
    fullName: "Dev Administrator",
    pictureUrl: "https://avatar.vercel.sh/devadmin",
    tenantId: "11111111-1111-1111-1111-111111111111", // Standard Dev Tenant
  };

  constructor(private authService: IAuthService) {}

  /**
   * POST /api/v1/auth/dev-login
   * Validates a secret key and returns a real JWT for the Dev Admin.
   */
  public async devLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // 1. Strict Industry Safety Guard: Only active in dev mode with explicit flag
    if (env.NODE_ENV === "production" || !env.ENABLE_DEVELOPMENT_LOGIN) {
      return next(
        new ForbiddenError("Development login is strictly disabled."),
      );
    }

    const { secret } = req.body;

    // 2. Secret Validation (Preventing brute-force or accidental exposure)
    if (!env.DEV_AUTH_SECRET || secret !== env.DEV_AUTH_SECRET) {
      return next(new UnauthorizedError("Invalid development secret."));
    }

    try {
      // 3. Generate a real token using the standard signing logic
      const token = this.authService.generateToken(this.DEV_USER);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Development Login Successful",
        {
          user: this.DEV_USER,
          token,
          note: "This token is for testing purposes only and uses a dummy tenant ID.",
        },
      );
    } catch (err) {
      next(err);
    }
  }
}
