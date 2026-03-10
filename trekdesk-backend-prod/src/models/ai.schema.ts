import { z } from "zod";

/**
 * Zod schema defining the core AI configuration parameters for a given session.
 * Used internally for passing contextual data to the language model.
 */
export const AISettingsSchema = z.object({
  voiceName: z.string(),
  systemInstruction: z.string(),
  temperature: z.number().min(0).max(1),
});
export type AISettings = z.infer<typeof AISettingsSchema>;

/**
 * Zod schema defining the structure of an incoming tool execution request from the Gemini Realtime API.
 */
export const ToolCallSchema = z.object({
  name: z.string(),
  args: z.any(),
  id: z.string(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

/**
 * Zod schema defining a standard text-based conversational turn.
 */
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "ai", "system"]),
  text: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Zod schema validating the JSON arguments passed by the AI when executing the itinerary generation tool.
 */
export const ItineraryGenerationArgsSchema = z.object({
  type: z.enum(["weather", "itinerary"]),
  trek_name: z.string(),
});
export type ItineraryGenerationArgs = z.infer<
  typeof ItineraryGenerationArgsSchema
>;

/**
 * Zod schema modeling the direct database representation of a tenant's AI Persona.
 */
export const AISettingsRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  voice_name: z.string().min(1).max(100),
  system_instruction: z.string().max(10000),
  temperature: z.number().min(0).max(2),
  created_at: z.date(),
  updated_at: z.date(),
});
export type AISettingsRow = z.infer<typeof AISettingsRowSchema>;

/**
 * DTO validation schema utilized when a frontend client requests an update to their AI Assistant configuration.
 */
export const UpdateAISettingsPayloadSchema = z.object({
  tenant_id: z.string().uuid(),
  voice_name: z.string().min(1).max(100),
  system_instruction: z.string().max(10000),
  temperature: z.number().min(0).max(2),
});
export type UpdateAISettingsPayload = z.infer<
  typeof UpdateAISettingsPayloadSchema
>;
