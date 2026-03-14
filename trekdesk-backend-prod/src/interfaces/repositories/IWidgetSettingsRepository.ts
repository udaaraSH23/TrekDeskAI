import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../../models/widget.schema";

export interface IWidgetSettingsRepository {
  getSettingsByTenant(tenantId: string): Promise<WidgetSettingsRow | null>;
  updateSettings(data: UpdateWidgetSettingsPayload): Promise<WidgetSettingsRow>;
}
