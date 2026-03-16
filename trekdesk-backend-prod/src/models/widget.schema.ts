/**
 * @module WidgetModels
 * @category Models
 *
 * Defines the data structures and validation schemas for the AI Chat Widget configuration.
 * Uses Zod for runtime validation and type inference.
 */

import { z } from "zod";

/**
 * Zod schema for the persistent widget configuration in the database.
 */
export const WidgetSettingsRowSchema = z.object({
  /** Unique identifier for the tenant (UUID) */
  tenant_id: z.string().uuid(),
  /** Primary brand color in HEX format (e.g., '#10b981') */
  primary_color: z.string().length(7),
  /** Visual position of the widget on the host website */
  position: z.enum(["left", "right"]),
  /** The greeting message displayed before the user starts the session. */
  initial_message: z.string(),
  /** The name of the AI agent displayed in the widget UI */
  agent_name: z.string().min(1).max(100).default("TrekDesk AI"),
  /** List of authorized domains allowed to embed this widget */
  allowed_origins: z.array(z.string()),
  /** Timestamp of the last configuration update */
  updated_at: z.date(),
});

/**
 * TypeScript representation of a widget settings record.
 * @typedef {Object} WidgetSettingsRow
 */
export type WidgetSettingsRow = z.infer<typeof WidgetSettingsRowSchema>;

/**
 * Zod schema for updating widget configuration.
 * All fields except tenant_id are optional to support partial updates.
 */
export const UpdateWidgetSettingsPayloadSchema = z.object({
  /** Unique identifier for the tenant being updated */
  tenant_id: z.string().uuid(),
  /** Optional new HEX color for the widget */
  primary_color: z.string().length(7).optional(),
  /** Optional new position of the widget */
  position: z.enum(["left", "right"]).optional(),
  /** Optional new greeting message */
  initial_message: z.string().optional(),
  /** Optional new agent name */
  agent_name: z.string().min(1).max(100).optional(),
  /** Optional new list of authorized origins */
  allowed_origins: z.array(z.string()).optional(),
});

/**
 * TypeScript representation of the update payload for widget settings.
 * @typedef {Object} UpdateWidgetSettingsPayload
 */
export type UpdateWidgetSettingsPayload = z.infer<
  typeof UpdateWidgetSettingsPayloadSchema
>;
