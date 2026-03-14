import { query } from "../config/database";
import { IWidgetSettingsRepository } from "../interfaces/repositories/IWidgetSettingsRepository";
import {
  WidgetSettingsRow,
  UpdateWidgetSettingsPayload,
} from "../models/widget.schema";

export class WidgetSettingsRepository implements IWidgetSettingsRepository {
  public async getSettingsByTenant(
    tenantId: string,
  ): Promise<WidgetSettingsRow | null> {
    const result = await query(
      "SELECT * FROM widget_settings WHERE tenant_id = $1",
      [tenantId],
    );

    return (result.rows[0] as WidgetSettingsRow) || null;
  }

  public async updateSettings(
    data: UpdateWidgetSettingsPayload,
  ): Promise<WidgetSettingsRow> {
    const result = await query(
      `INSERT INTO widget_settings (tenant_id, primary_color, position, initial_message, allowed_origins, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id) DO UPDATE 
       SET primary_color = COALESCE(EXCLUDED.primary_color, widget_settings.primary_color),
           position = COALESCE(EXCLUDED.position, widget_settings.position),
           initial_message = COALESCE(EXCLUDED.initial_message, widget_settings.initial_message),
           allowed_origins = COALESCE(EXCLUDED.allowed_origins, widget_settings.allowed_origins),
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        data.tenant_id,
        data.primary_color || null,
        data.position || null,
        data.initial_message || null,
        data.allowed_origins || null,
      ],
    );

    return result.rows[0] as WidgetSettingsRow;
  }
}
