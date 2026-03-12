/**
 * @file AuthService.ts
 * @description Authentication service for managing Google OAuth2 and JWT-based sessions.
 * Handles token verification, user synchronization, and session token generation.
 */

import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { GOOGLE_AUTH_WHITELIST, MVP_TENANT_ID } from "../config/constants";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IAuthService } from "../interfaces/services/IAuthService";
import { AuthUser } from "../models/auth.schema";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Configuration for the Google OAuth2 client using the provided Client ID from environment variables.
 */
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Secret key used for signing and verifying JSON Web Tokens (JWT).
 */
const JWT_SECRET = env.JWT_SECRET;

/**
 * Service class for authentication and authorization workflows.
 */
export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Verifies a Google ID Token sent by the client and synchronizes the user in the local database.
   *
   * This method performs the following:
   * 1. Validates the integrity of the Google ID Token.
   * 2. Checks if the user's email is within the allowed MVP whitelist.
   * 3. Upserts the user record in the local database (UserRepository).
   *
   * @param idToken - The raw ID token string provided by Google Identity Services.
   * @returns A Promise resolving to an AuthUser object if successful, or null if verification fails.
   */
  public async verifyGoogleToken(idToken: string): Promise<AuthUser | null> {
    try {
      // Verify token with Google's public keys
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) return null;

      // Business logic: Check against Whitelist for the MVP phase
      // This ensures only authorized testers/partners can access the system.
      if (!GOOGLE_AUTH_WHITELIST.includes(payload.email)) {
        logger.warn(
          `[AuthService] Unauthorized login attempt: ${payload.email}`,
        );
        return null;
      }

      // Synchronize with local database: Find existing user or create a new one.
      // We use the 'sub' (Subject) from Google as the unique provider ID.
      const user = await this.userRepository.upsertGoogleUser({
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name || "",
        pictureUrl: payload.picture || "",
        tenantId: MVP_TENANT_ID,
      });

      if (!user) return null;

      // Map database record to the application's AuthUser shape
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        pictureUrl: user.picture_url,
        tenantId: user.tenant_id,
      };
    } catch (err) {
      // Handle potential network or verification failures
      logger.error("[AuthService] Token verification error:", err);
      return null;
    }
  }

  /**
   * Generates a signed JSON Web Token (JWT) for a verified user.
   * The token is encoded with the AuthUser payload and expires in 7 days.
   *
   * @param user - The authenticated user data to encode into the token.
   * @returns A signed JWT string.
   */
  public generateToken(user: AuthUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Synchronously verifies a JWT and decodes the AuthUser payload.
   *
   * @param token - The JWT string to verify.
   * @returns The decoded AuthUser payload if the token is valid, otherwise null.
   */
  public verifyJWToken(token: string): AuthUser | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch {
      // Return null on invalid, expired, or malformed tokens
      return null;
    }
  }
}
