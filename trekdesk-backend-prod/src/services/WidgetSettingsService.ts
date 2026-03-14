import { IWidgetSettingsRepository } from "../interfaces/repositories/IWidgetSettingsRepository";
import { IWidgetSettingsService } from "../interfaces/services/IWidgetSettingsService";
import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../models/widget.schema";

export class WidgetSettingsService implements IWidgetSettingsService {
  constructor(private widgetSettingsRepository: IWidgetSettingsRepository) {}

  public async getSettingsByTenant(
    tenantId: string,
  ): Promise<WidgetSettingsRow | null> {
    return this.widgetSettingsRepository.getSettingsByTenant(tenantId);
  }

  public async updateSettings(
    data: UpdateWidgetSettingsPayload,
  ): Promise<WidgetSettingsRow> {
    return this.widgetSettingsRepository.updateSettings(data);
  }
}
