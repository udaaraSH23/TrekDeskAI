/**
 * @file auth.schema.ts
 * @description Zod schemas and TypeScript types for authentication and user sessions.
 */
import { z } from "zod";

/**
 * Zod schema mirroring the database schema for the global `users` table.
 * Includes timestamps, identity tracking, and RBAC logic.
 */
export const UserRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  google_id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  picture_url: z.string().url(),
  role: z.string(),
  last_login: z.date(),
  created_at: z.date(),
});

export type UserRow = z.infer<typeof UserRowSchema>;

/**
 * Zod schema for the short-lived authenticated user session.
 * Actively signed and deserialized via the internal JWT mechanism payload.
 */
export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  pictureUrl: z.string().url(),
  tenantId: z.string().uuid(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

/**
 * Zod DTO schema validating the data received from the official Google OAuth Client upon sign-in.
 * Guaranteed to provide names, emails, and provider-issued IDs.
 */
export const GoogleUserPayloadSchema = z.object({
  googleId: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  pictureUrl: z.string().url(),
  tenantId: z.string().uuid(),
});

export type GoogleUserPayload = z.infer<typeof GoogleUserPayloadSchema>;
