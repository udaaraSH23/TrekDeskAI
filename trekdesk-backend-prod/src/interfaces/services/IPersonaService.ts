/**
 * @file IPersonaService.ts
 * @description Interface definition for standardizing AI Persona business logic.
 */

import { AISettingsRow, UpdateAISettingsPayload } from "../../models/ai.schema";

export interface IPersonaService {
  /**
   * Retrieves the current systemic parameters dictating the Agent's behavior.
   *
   * @param tenantId - The UUID identity boundary of the operator.
   * @returns A promise resolving to the AI settings config object.
   */
  getSettingsByTenant(tenantId: string): Promise<AISettingsRow | null>;

  /**
   * Persists new constraints and vocal identities to the AI Agent.
   *
   * @param payload - The data transfer object containing the modified settings and scoped tenant block.
   * @returns A promise resolving to the updated configuration.
   */
  updateSettings(payload: UpdateAISettingsPayload): Promise<AISettingsRow>;
}
