/**
 * @file auth.types.ts
 * @description Frontend user and auth types aligned with the backend's `AuthUserSchema`.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/auth.schema.ts → AuthUserSchema`
 *
 * Field mapping from backend AuthUserSchema:
 *  - id          → string (UUID)
 *  - email       → string
 *  - fullName    → string  (camelCase — already serialized by the backend JWT service)
 *  - pictureUrl  → string  (camelCase — same reason)
 *  - tenantId    → string (UUID)
 *
 * NOTE: `role` is NOT part of the JWT payload (AuthUserSchema), so it is excluded here.
 * It exists only on the DB row (UserRowSchema). If RBAC is added to the JWT in the
 * future, add it back here at that point.
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * The authenticated user object deserialized from the backend JWT payload.
 * Aligned with `AuthUserSchema` in `auth.schema.ts`.
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  pictureUrl: string;
  tenantId: string;
}

/**
 * The `data` portion of a successful auth API response (login / verify).
 */
export interface AuthData {
  user: User;
  token: string;
}

/**
 * Full typed response for auth endpoints (login, dev-login).
 */
export type AuthResponse = ApiSuccessResponse<AuthData>;
