/**
 * @module WidgetServices
 * @category Services
 */

import { IWidgetSettingsRepository } from "../interfaces/repositories/IWidgetSettingsRepository";
import { IWidgetSettingsService } from "../interfaces/services/IWidgetSettingsService";
import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../models/widget.schema";

/**
 * Service responsible for the administrative management of widget configurations.
 * Orchestrates calls between the controller and the repository.
 *
 * @class
 * @implements {IWidgetSettingsService}
 */
export class WidgetSettingsService implements IWidgetSettingsService {
  /**
   * @param widgetSettingsRepository Injected repository for database access.
   */
  constructor(private widgetSettingsRepository: IWidgetSettingsRepository) {}

  /**
   * Fetches settings for a specific tenant.
   *
   * @param tenantId UUID of the tenant.
   * @returns {Promise<WidgetSettingsRow | null>}
   */
  public async getSettingsByTenant(
    tenantId: string,
  ): Promise<WidgetSettingsRow | null> {
    return this.widgetSettingsRepository.getSettingsByTenant(tenantId);
  }

  /**
   * Updates settings for a specific tenant.
   *
   * @param data The payload containing new configuration values.
   * @returns {Promise<WidgetSettingsRow>}
   */
  public async updateSettings(
    data: UpdateWidgetSettingsPayload,
  ): Promise<WidgetSettingsRow> {
    return this.widgetSettingsRepository.updateSettings(data);
  }
}
