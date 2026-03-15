/**
 * @file logs.schema.ts
 * @description Zod schemas and TypeScript types for AI call logs and interaction statistics.
 */
import { z } from "zod";

/**
 * Zod structure representing the macroscopic statistical reduction of AI phone logs.
 * Summarizes the frequency of calls and categorized outcomes (e.g. hot leads).
 */
export const CallLogStatsSchema = z.object({
  totalCalls: z.number().int().nonnegative(),
  hotLeads: z.array(z.unknown()), // Can be typed further if the structure of hot leads is known
  leadsCount: z.number().int().nonnegative(),
});

export type CallLogStats = z.infer<typeof CallLogStatsSchema>;

/**
 * A single conversational turn, aligned with Geminis role-based history.
 */
const TranscriptMessageSchema = z.object({
  role: z.enum(["user", "ai", "system"]),
  text: z.string(),
});

/**
 * Zod mapping to the `call_logs` table schema structure.
 * Represents an individual trace of a specific AI-to-User interaction session, detailing sentiment and length.
 */
export const CallLogSchema = z.object({
  id: z.string().uuid("Invalid Call Log ID format"),
  tenant_id: z.string().uuid(),
  session_id: z.string(),
  /** Structured transcript array for JSONB storage/retrieval */
  transcript: z.array(TranscriptMessageSchema).nullable().optional(),
  summary: z.string().nullable().optional(),
  sentiment_score: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  created_at: z.date(),
});

export type CallLog = z.infer<typeof CallLogSchema>;

/**
 * DTO for the internal payload required to initialize a new Call Log trace.
 * This is typically triggered the moment a WebSocket establishes connection.
 */
export const CreateCallLogPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(5),
});
export type CreateCallLogPayload = z.infer<typeof CreateCallLogPayloadSchema>;

/**
 * DTO for the internal payload required to seal a completed Call Log trace.
 * Contains transcript data and synthetic analytics like sentiment and duration.
 */
export const UpdateCallLogPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(5),
  transcript: z.array(TranscriptMessageSchema),
  summary: z.string(),
  sentimentScore: z.number().min(0).max(1),
  durationSeconds: z.number().nonnegative(),
});
export type UpdateCallLogPayload = z.infer<typeof UpdateCallLogPayloadSchema>;

/**
 * DTO for the payload provided by the WebSocket when terminating a voice session.
 */
export const EndCallSessionPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(5),
  transcriptText: z.string(),
  durationSeconds: z.number().nonnegative(),
});
export type EndCallSessionPayload = z.infer<typeof EndCallSessionPayloadSchema>;

/**
 * DTO for deleting a call log (enforces tenant scoping).
 */
export const DeleteCallLogPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  logId: z.string().uuid(),
});
export type DeleteCallLogPayload = z.infer<typeof DeleteCallLogPayloadSchema>;
