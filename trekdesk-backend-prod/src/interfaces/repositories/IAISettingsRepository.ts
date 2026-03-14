/**
 * @file IAISettingsRepository.ts
 * @description Repository interface for AI Persona configuration.
 */

import { UpdatePersonaDTO, PersonaResponseDTO } from "../../dtos/PersonaDTO";

/**
 * Interface definition for manipulating the baseline AI persona data context.
 * Represents interactions to configure the AI system behavior per tenant.
 */
export interface IAISettingsRepository {
  /**
   * Loads the current configuration (voice, personality, instructions) applied to a tenant.
   *
   * @param tenantId - The scoped UUID indicating which operator's AI to fetch.
   * @returns A Promise resolving to the specific config, or null if defaulting.
   */
  getSettingsByTenant(tenantId: string): Promise<PersonaResponseDTO | null>;

  /**
   * Upserts the active persona settings, overwriting existing directives securely.
   *
   * @param data - The configuration DTO specifying the desired new AI state.
   * @returns A Promise resolving to the newly persisted row.
   */
  updateSettings(data: UpdatePersonaDTO): Promise<PersonaResponseDTO>;
}
