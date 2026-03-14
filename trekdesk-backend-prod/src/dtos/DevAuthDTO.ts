/**
 * @file DevAuthDTO.ts
 * @description Data Transfer Objects for Development Authentication.
 */

import { AuthUser } from "../models/auth.schema";

/**
 * Request payload for development login.
 */
export interface DevLoginRequestDTO {
  /**
   * Secret key to bypass OAuth.
   */
  secret: string;
}

/**
 * Response payload for development login.
 */
export interface DevLoginResponseDTO {
  /**
   * The authenticated "Dev Admin" user details.
   */
  user: AuthUser;
  /**
   * The generated JWT token.
   */
  token: string;
  /**
   * Additional diagnostic note.
   */
  note: string;
}
