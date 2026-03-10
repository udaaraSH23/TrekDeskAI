import { UserRow, GoogleUserPayload } from "../../models/auth.schema";

/**
 * Interface definition for the User data repository.
 * Abstracts the underlying database implementation for user entity management.
 */
export interface IUserRepository {
  /**
   * Upserts a user record based on incoming Google OAuth data.
   *
   * @param data - The GoogleUserPayload DTO containing validated SSO details.
   * @returns A Promise resolving to the synchronized UserRow, or null on failure.
   */
  upsertGoogleUser(data: GoogleUserPayload): Promise<UserRow | null>;
}
