import api from "../../../services/api";
import type { ApiSuccessResponse } from "../../../types/api.types";
import type {
  WidgetSettings,
  UpdateWidgetSettingsPayload,
} from "../types/widget.types";

export const WidgetService = {
  /**
   * Fetches the current widget settings for the tenant.
   */
  async getSettings(): Promise<WidgetSettings> {
    const response =
      await api.get<ApiSuccessResponse<WidgetSettings>>("/widget/settings");
    return response.data.data;
  },

  /**
   * Updates the widget settings for the tenant.
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
