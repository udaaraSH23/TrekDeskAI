/**
 * @file auth.types.ts
 * @description Frontend user and auth types aligned with the backend's `AuthUserSchema`.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/auth.schema.ts → AuthUserSchema`
 *
 * Field mapping from backend AuthUserSchema:
 *  - id          → string (UUID)
 *  - email       → string
 *  - fullName    → string  (camelCase — serialized by backend JWT service)
 *  - pictureUrl  → string  (camelCase — serialized by backend JWT service)
 *  - tenantId    → string (UUID)
 *
 * NOTE: `role` is excluded from the JWT payload for security/minimalism.
 * If RBAC is required in the future, it should be added to the JWT payload
 * on the backend first.
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * User
 *
 * The authenticated user object deserialized from the backend JWT payload.
 * Provides basic profile information for the UI.
 */
export interface User {
  /** Unique identifier for the user (UUID). */
  id: string;
  /** Primary contact email. */
  email: string;
  /** User's full display name. */
  fullName: string;
  /** Absolute URL to the user's Google profile picture. */
  pictureUrl: string;
  /** The tenant (organization) ID the user belongs to. */
  tenantId: string;
}

/**
 * AuthData
 *
 * The encapsulated data returned by authentication endpoints.
 */
export interface AuthData {
  /** The deserialized user metadata. */
  user: User;
  /** The raw JWT session token for storage in localStorage. */
  token: string;
}

/**
 * AuthResponse
 *
 * Full typed response for auth endpoints (login, dev-login).
 */
export type AuthResponse = ApiSuccessResponse<AuthData>;
