/**
 * @module WidgetService
 * @category Services
 *
 * Provides an interface for interacting with the backend API regarding widget configuration.
 * All methods in this service are asynchronous and return promises.
 */

import api from "../../../services/api";
import type { ApiSuccessResponse } from "../../../types/api.types";
import type {
  WidgetSettings,
  UpdateWidgetSettingsPayload,
} from "../types/widget.types";

/**
 * Service for interacting with Widget-related API endpoints.
 * Handles configuration for the customer-facing chat widget.
 */
export const WidgetService = {
  /**
   * Fetches the current widget settings for the authenticated tenant.
   *
   * This method calls the `GET /widget/settings` endpoint.
   *
   * @returns {Promise<WidgetSettings>} A promise that resolves to the current widget configuration.
   * @throws {Error} Thrown if the network request fails or the server returns a non-200 status.
   *
   * @example
   * ```typescript
   * const settings = await WidgetService.getSettings();
   * console.log(settings.primary_color);
   * ```
   */
  async getSettings(): Promise<WidgetSettings> {
    const response =
      await api.get<ApiSuccessResponse<WidgetSettings>>("/widget/settings");
    return response.data.data;
  },

  /**
   * Updates the widget settings for the authenticated tenant.
   *
   * This method calls the `PUT /widget/settings` endpoint with the provided payload.
   *
   * @param {UpdateWidgetSettingsPayload} payload Partial or full settings to be updated.
   * @returns {Promise<WidgetSettings>} A promise that resolves to the updated configuration.
   * @throws {Error} Thrown if validation fails on the server or the user is unauthorized.
   *
   * @example
   * ```typescript
   * await WidgetService.updateSettings({ primary_color: "#ff0000" });
   * ```
   */
  async updateSettings(
    payload: UpdateWidgetSettingsPayload,
  ): Promise<WidgetSettings> {
    const response = await api.put<ApiSuccessResponse<WidgetSettings>>(
      "/widget/settings",
      payload,
    );
    return response.data.data;
  },
};
