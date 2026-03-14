/**
 * @file persona.types.ts
 * @description Frontend AI persona types aligned with the backend's AI settings schemas.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/ai.schema.ts`
 *
 * Two schemas are relevant:
 *  - `AISettingsRowSchema`          → What the DB stores (snake_case, includes timestamps)
 *  - `UpdateAISettingsPayloadSchema` → What the PATCH endpoint accepts
 *
 * The frontend uses snake_case to match the backend's DB column names
 * as they are returned directly by the API.
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * AI persona settings as returned by GET /persona.
 * Aligned with `AISettingsRowSchema` (minus internal DB fields like `tenant_id`, timestamps).
 */
export interface PersonaSettings {
  /** Display/voice name for the AI assistant (max 100 chars) */
  voice_name: string;
  /** The system prompt that shapes AI behavior (max 10,000 chars) */
  system_instruction: string;
  /** Controls randomness in AI responses. Range: 0.0 (deterministic) – 2.0 (creative) */
  temperature: number;
}

/** Typed success response for GET /persona and PATCH /persona */
export type PersonaResponse = ApiSuccessResponse<PersonaSettings>;
