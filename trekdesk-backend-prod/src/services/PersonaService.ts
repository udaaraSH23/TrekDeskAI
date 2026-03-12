/**
 * @file PersonaService.ts
 * @description The Business Logic layer responsible for mediating AI Persona configuration changes.
 */
import { IPersonaService } from "../interfaces/services/IPersonaService";
import { IAISettingsRepository } from "../interfaces/repositories/IAISettingsRepository";
import { AISettingsRow, UpdateAISettingsPayload } from "../models/ai.schema";

export class PersonaService implements IPersonaService {
  constructor(private aiSettingsRepository: IAISettingsRepository) {}

  public async getSettingsByTenant(
    tenantId: string,
  ): Promise<AISettingsRow | null> {
    // In a mature app, this is where we might check a Redis cache before hitting the DB
    return this.aiSettingsRepository.getSettingsByTenant(tenantId);
  }

  public async updateSettings(
    payload: UpdateAISettingsPayload,
  ): Promise<AISettingsRow> {
    // In a mature app, this is where we would flush the Redis cache or emit a
    // WebSocket event to tell active calls that their systemic limits have shifted.
    return this.aiSettingsRepository.updateSettings(payload);
  }
}
