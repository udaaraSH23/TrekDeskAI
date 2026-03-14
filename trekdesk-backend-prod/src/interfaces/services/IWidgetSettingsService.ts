import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../../models/widget.schema";

export interface IWidgetSettingsService {
  getSettingsByTenant(tenantId: string): Promise<WidgetSettingsRow | null>;
  updateSettings(data: UpdateWidgetSettingsPayload): Promise<WidgetSettingsRow>;
}
