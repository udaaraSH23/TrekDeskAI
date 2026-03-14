/**
 * @file PersonaDTO.ts
 * @description Data Transfer Objects for the AI Persona module.
 */

import { AISettingsRow, UpdateAISettingsPayload } from "../models/ai.schema";

/**
 * DTO for updating AI settings.
 * Standardizes the structure for behavioral definitions.
 */
export type UpdatePersonaDTO = UpdateAISettingsPayload;

/**
 * DTO representing the response for AI settings.
 * Maps closely to the database row for consistency.
 */
export type PersonaResponseDTO = AISettingsRow;
