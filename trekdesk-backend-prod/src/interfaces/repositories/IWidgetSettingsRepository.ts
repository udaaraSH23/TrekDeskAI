/**
 * @module WidgetInterfaces
 * @category Interfaces
 */

import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../../models/widget.schema";

/**
 * Interface for the Widget Settings Repository.
 * Handles the persistence of widget-level configurations.
 */
export interface IWidgetSettingsRepository {
  /**
   * Retrieves the widget configuration for a specific tenant.
   * @param tenantId The unique UUID of the tenant.
   * @returns A promise resolving to the settings or null if not found.
   */
  getSettingsByTenant(tenantId: string): Promise<WidgetSettingsRow | null>;

  /**
   * Updates or initializes the widget configuration for a tenant.
   * Implements an 'upsert' pattern for configuration persistence.
   * @param data The settings payload to persist.
   * @returns A promise resolving to the newly updated settings.
   */
  updateSettings(data: UpdateWidgetSettingsPayload): Promise<WidgetSettingsRow>;
}
