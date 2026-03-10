/**
 * @file personaValidators.ts
 * @description Zod validation schemas for AI Persona management.
 * These schemas validate updates to the AI's behavior, voice, and generation settings.
 */

import { z } from "zod";

import { AISettingsRowSchema } from "../models/ai.schema";

/**
 * Validation schema for updating the trek guide's AI persona.
 * All fields are optional to allow partial updates of the persona configuration.
 */
export const updatePersonaSchema = z.object({
  body: AISettingsRowSchema.pick({
    voice_name: true,
    system_instruction: true,
    temperature: true,
  }).partial(),
});
