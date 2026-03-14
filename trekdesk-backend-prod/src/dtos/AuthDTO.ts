/**
 * @file AuthDTO.ts
 * @description Data Transfer Objects for the Authentication module.
 */

import { AuthUser } from "../models/auth.schema";

/**
 * DTO for Google OAuth login requests.
 */
export interface GoogleLoginDTO {
  idToken: string;
}

/**
 * DTO representing the response for a successful login.
 */
export interface LoginResponseDTO {
  user: AuthUser;
  token: string;
}

/**
 * DTO representing an authenticated user.
 */
export type UserDTO = AuthUser;
