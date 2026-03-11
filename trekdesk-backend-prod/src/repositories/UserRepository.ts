/**
 * @file UserRepository.ts
 * @description Data access logic for user identity and profile management.
 */
import { query } from "../config/database";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserRow, GoogleUserPayload } from "../models/auth.schema";

/**
 * Repository implementation for managing User entities.
 * Interacts directly with the PostgreSQL database.
 */
export class UserRepository implements IUserRepository {
  /**
   * Finds or creates a user based on their Google OAuth profile.
   * If the user already exists, updates their last login time and profile details
   * to keep the local database synchronized with their Google account.
   *
   * @param data - The parsed and validated Google user attributes (DTO).
   * @returns A Promise resolving to the created or updated user record.
   */
  public async upsertGoogleUser(
    data: GoogleUserPayload,
  ): Promise<UserRow | null> {
    const result = await query(
      `INSERT INTO users (google_id, email, full_name, picture_url, tenant_id, last_login)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (google_id) DO UPDATE 
       SET last_login = CURRENT_TIMESTAMP,
           full_name = EXCLUDED.full_name,
           picture_url = EXCLUDED.picture_url
       RETURNING *`,
      [
        data.googleId,
        data.email,
        data.fullName,
        data.pictureUrl,
        data.tenantId,
      ],
    );

    return (result.rows[0] as UserRow) || null;
  }
}
