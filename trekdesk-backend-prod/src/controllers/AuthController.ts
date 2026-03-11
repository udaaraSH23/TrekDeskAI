/**
 * @file AuthController.ts
 * @description Controller for handling authentication-related HTTP requests.
 */
import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import {
  BadRequestError,
  UnauthorizedError,
} from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";

/**
 * Controller handling HTTP requests linked to authentication flows.
 * Converts external credentials (like Google OAuth) into internal JWT sessions.
 */
export class AuthController {
  constructor(private authService: IAuthService) {}

  /**
   * POST /api/auth/google
   * Takes an incoming Google ID token, verifies it, and upserts the shadow record locally.
   * Returns a signed local JWT to be used for subsequent API calls.
   *
   * @param req - Express request object containing `idToken` in the body.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async googleLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { idToken } = req.body;

    if (!idToken) {
      return next(new BadRequestError("ID Token is required"));
    }

    try {
      const user = await this.authService.verifyGoogleToken(idToken);

      if (!user) {
        return next(
          new UnauthorizedError(
            "Unauthorized: Access restricted to whitelisted accounts",
          ),
        );
      }

      const token = this.authService.generateToken(user);

      ApiResponse.sendSuccess(res, HttpStatus.OK, "Login successful", {
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/verify
   * Returns validation of the caller's active session, utilizing the AuthUser injected by `authMiddleware`.
   *
   * @param req - Express (Authenticated) request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async verifySession(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    ApiResponse.sendSuccess(res, HttpStatus.OK, "Session verified", {
      user: req.user,
    });
  }
}
