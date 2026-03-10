import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../models/auth.schema";
import { UnauthorizedError } from "../utils/errors/CustomErrors";
import { authService } from "../config/di";

/**
 * Extended Express Request interface that optionally includes the verified AuthUser object.
 * This allows downstream controllers to safely access `req.user`.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Express middleware for protecting HTTP routes requiring authentication.
 *
 * 1. Checks for the presence of a valid `Authorization: Bearer <token>` header.
 * 2. Synchronously verifies the JWT signature and expiration via the AuthService.
 * 3. Injects the decoded `AuthUser` payload into the `request` object for downstream use.
 * 4. Intercepts and returns a 401 Unauthorized response if any validation fails.
 *
 * @param req - The inbound HTTP Request object.
 * @param res - The outbound HTTP Response object.
 * @param next - The Express next function to pass control to the route handler.
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Unauthorized: No token provided"));
  }

  const token = authHeader.split(" ")[1];
  const user = authService.verifyJWToken(token);

  if (!user) {
    return next(
      new UnauthorizedError("Unauthorized: Invalid or expired token"),
    );
  }

  req.user = user;
  next();
};
