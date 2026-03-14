import { z } from "zod";

export const WidgetSettingsRowSchema = z.object({
  tenant_id: z.string().uuid(),
  primary_color: z.string().length(7),
  position: z.enum(["left", "right"]),
  initial_message: z.string(),
  allowed_origins: z.array(z.string()),
  updated_at: z.date(),
});

export type WidgetSettingsRow = z.infer<typeof WidgetSettingsRowSchema>;

export const UpdateWidgetSettingsPayloadSchema = z.object({
  tenant_id: z.string().uuid(),
  primary_color: z.string().length(7).optional(),
  position: z.enum(["left", "right"]).optional(),
  initial_message: z.string().optional(),
  allowed_origins: z.array(z.string()).optional(),
});

export type UpdateWidgetSettingsPayload = z.infer<
  typeof UpdateWidgetSettingsPayloadSchema
>;
