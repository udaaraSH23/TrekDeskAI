/**
 * @file personaValidators.ts
 * @description Client-side Zod validation schemas for the AI persona settings form.
 *
 * Mirrors the backend's `UpdateAISettingsPayloadSchema` from:
 *   `trekdesk-backend-prod/src/models/ai.schema.ts`
 *
 * Key constraint to note:
 *   `temperature` range is 0–2 (not 0–1). The backend's `AISettingsRowSchema`
 *   uses `z.number().min(0).max(2)`, not max(1). This is because Gemini models
 *   support a temperature range of 0 to 2.
 *
 * NOTE: Uses Zod v4 API.
 */

import { z } from "zod";

/**
 * Validates the payload for updating the AI persona configuration.
 * Mirrors `UpdateAISettingsPayloadSchema` on the backend.
 */
export const updatePersonaSchema = z.object({
  voice_name: z
    .string("Voice name is required")
    .min(1, "Voice name cannot be empty")
    .max(100, "Voice name is too long (max 100 characters)"),

  system_instruction: z
    .string("System instruction is required")
    .max(10000, "System instruction is too long (max 10,000 characters)"),

  temperature: z
    .number("Temperature must be a number")
    .min(0, "Temperature must be at least 0")
    .max(2, "Temperature cannot exceed 2"),
});

export type PersonaFormValues = z.infer<typeof updatePersonaSchema>;
