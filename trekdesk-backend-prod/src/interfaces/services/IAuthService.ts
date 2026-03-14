/**
 * @file IAuthService.ts
 * @description Interface representing the authentication and authorization business logic.
 */

import { UserDTO } from "../../dtos/AuthDTO";

/**
 * Interface representing the authentication and authorization business logic.
 */
export interface IAuthService {
  /**
   * Verifies a Google OAuth2 ID Token and returns the extracted user details.
   * @param idToken The token string provided by the Google sign-in client.
   * @returns The authenticated user data, or null if validation fails.
   */
  verifyGoogleToken(idToken: string): Promise<UserDTO | null>;

  /**
   * Generates a signed JSON Web Token (JWT) for a verified user.
   * @param user The authenticated user object to encode in the token.
   * @returns A signed JWT string.
   */
  generateToken(user: UserDTO): string;

  /**
   * Verifies an incoming JWT and extracts the user payload.
   * @param token The Bearer token from the request header.
   * @returns The decoded user payload, or null if the token is invalid/expired.
   */
  verifyJWToken(token: string): UserDTO | null;
}
