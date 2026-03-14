/**
 * @file AISettingsRepository.ts
 * @description Data access logic for managing AI persona settings.
 */
import { query } from "../config/database";
import { IAISettingsRepository } from "../interfaces/repositories/IAISettingsRepository";
import { UpdatePersonaDTO, PersonaResponseDTO } from "../dtos/PersonaDTO";

/**
 * Repository implementation for managing AI Persona and System Instructions configurations.
 * Interacts directly with the PostgreSQL database.
 */
export class AISettingsRepository implements IAISettingsRepository {
  /**
   * Retrieves the AI persona settings for a specific tenant.
   * This drives the baseline instruction set passed into the LLM during initialization.
   *
   * @param tenantId - The UUID of the tenant/tour operator.
   * @returns A Promise resolving to the AI settings row, or null if unset.
   */
  public async getSettingsByTenant(
    tenantId: string,
  ): Promise<PersonaResponseDTO | null> {
    const result = await query(
      "SELECT voice_name, system_instruction, temperature FROM ai_settings WHERE tenant_id = $1",
      [tenantId],
    );

    return (result.rows[0] as PersonaResponseDTO) || null;
  }

  /**
   * Updates or creates new AI personalization settings for a tenant.
   * Includes conflict resolution to upsert the active row.
   *
   * @param data - The parsed payload DTO containing the system instruction, voice config, and temperature.
   * @returns A Promise resolving to the newly updated settings database row.
   */
  public async updateSettings(
    data: UpdatePersonaDTO,
  ): Promise<PersonaResponseDTO> {
    const result = await query(
      `INSERT INTO ai_settings (tenant_id, voice_name, system_instruction, temperature, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id) DO UPDATE 
       SET voice_name = EXCLUDED.voice_name,
           system_instruction = EXCLUDED.system_instruction,
           temperature = EXCLUDED.temperature,
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        data.tenant_id,
        data.voice_name,
        data.system_instruction,
        data.temperature,
      ],
    );

    return result.rows[0] as PersonaResponseDTO;
  }
}
