/**
 * @module WidgetInterfaces
 * @category Interfaces
 */

import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../../models/widget.schema";

/**
 * Interface for the Widget Settings Service.
 * Manages administrative operations for widget branding and configuration.
 */
export interface IWidgetSettingsService {
  /**
   * Fetches the branding and message settings for the specified tenant.
   * @param tenantId The unique UUID of the tenant.
   * @returns Promise resolving to settings or null.
   */
  getSettingsByTenant(tenantId: string): Promise<WidgetSettingsRow | null>;

  /**
   * Persists changes to the widget configuration.
   * @param data The updated settings payload.
   * @returns Promise resolving to the resulting configuration.
   */
  updateSettings(data: UpdateWidgetSettingsPayload): Promise<WidgetSettingsRow>;
}
