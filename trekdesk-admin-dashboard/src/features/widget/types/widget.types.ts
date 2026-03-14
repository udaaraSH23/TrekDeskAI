export interface WidgetSettings {
  tenant_id: string;
  primary_color: string;
  position: "left" | "right";
  initial_message: string;
  allowed_origins: string[];
  updated_at?: string;
}

export interface UpdateWidgetSettingsPayload {
  primary_color?: string;
  position?: "left" | "right";
  initial_message?: string;
  allowed_origins?: string[];
}
