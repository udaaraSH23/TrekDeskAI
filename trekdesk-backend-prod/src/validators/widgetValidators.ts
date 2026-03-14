import { z } from "zod";
import { WidgetSettingsRowSchema } from "../models/widget.schema";

export const updateWidgetSchema = z.object({
  body: WidgetSettingsRowSchema.omit({
    tenant_id: true,
    updated_at: true,
  }).partial(),
});
