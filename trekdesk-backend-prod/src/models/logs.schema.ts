import { z } from "zod";

/**
 * Zod structure representing the macroscopic statistical reduction of AI phone logs.
 * Summarizes the frequency of calls and categorized outcomes (e.g. hot leads).
 */
export const CallLogStatsSchema = z.object({
  totalCalls: z.number().int().nonnegative(),
  hotLeads: z.array(z.any()), // Can be typed further if the structure of hot leads is known
  leadsCount: z.number().int().nonnegative(),
});

export type CallLogStats = z.infer<typeof CallLogStatsSchema>;

/**
 * Zod mapping to the `call_logs` table schema structure.
 * Represents an individual trace of a specific AI-to-User interaction session, detailing sentiment and length.
 */
export const CallLogSchema = z.object({
  id: z.string().uuid("Invalid Call Log ID format"),
  tenant_id: z.string().uuid(),
  session_id: z.string(),
  transcript: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  sentiment_score: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  created_at: z.date(),
});

export type CallLog = z.infer<typeof CallLogSchema>;
