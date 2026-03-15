/**
 * @file IDevAuthService.ts
 * @description Service interface for development-only authentication logic.
 */

import { DevLoginResponseDTO } from "../../dtos/DevAuthDTO";

/**
 * IDevAuthService
 *
 * Defines the contract for services that manage authentication bypasses.
 * This is primarily used in local development to simulate a valid session
 * without triggering Google's OAuth infrastructure.
 */
export interface IDevAuthService {
  /**
   * devLogin
   *
   * Validates a plaintext secret against the backend's environment configuration.
   * If successful, it generates a full session package (User + JWT) for a
   * hardcoded development identity.
   *
   * @param secret - The plaintext secret key provided by the developer.
   * @returns A promise resolving to a `DevLoginResponseDTO` containing the JWT and User info.
   *
   * @throws {UnauthorizedError} if the secret doesn't match the environment's `DEV_AUTH_SECRET`.
   * @throws {ForbiddenError} if the bypass is disabled (e.g., in production).
   */
  devLogin(secret: string): Promise<DevLoginResponseDTO>;
}
