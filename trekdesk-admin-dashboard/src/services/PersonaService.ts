/**
 * @file PersonaService.ts
 * @description Service for managing AI voice persona settings and instructions.
 *
 * Types are imported from `src/types/persona.types.ts` which is aligned with
 * the backend's `AISettingsRowSchema` and `UpdateAISettingsPayloadSchema`.
 *
 * Note: The `temperature` field range is 0–2, not 0–1.
 * The backend's `UpdateAISettingsPayloadSchema` uses `z.number().min(0).max(2)`.
 */

import api from "./api";
import type { PersonaSettings, PersonaResponse } from "../types/persona.types";

// Re-export for backward compatibility during transition
export type { PersonaSettings };

export const PersonaService = {
  /**
   * Retrieves the current AI persona configuration for the authenticated tenant.
   * @returns A promise resolving to the persona settings.
   * @throws {ApiError} If the API request fails.
   */
  getSettings: async (): Promise<PersonaSettings> => {
    const response = await api.get<PersonaResponse>("/persona/settings");
    return response.data.data;
  },

  /**
   * Updates the AI persona configuration.
   * @param settings - The new persona settings. Must satisfy `PersonaSettings`.
   *                   Validated client-side by `src/lib/validators/personaValidators.ts`.
   * @returns A promise resolving to the updated settings.
   * @throws {ApiError} If the update fails.
   */
  updateSettings: async (
    settings: PersonaSettings,
  ): Promise<PersonaSettings> => {
    const response = await api.put<PersonaResponse>(
      "/persona/settings",
      settings,
    );
    return response.data.data;
  },
};
