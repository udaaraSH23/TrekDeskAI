/**
 * @file analytics.types.ts
 * @description Frontend analytics types aligned with the backend's log and AI schemas.
 *
 * Source of truth:
 *  - `trekdesk-backend-prod/src/models/logs.schema.ts`   → CallLog shape
 *  - `trekdesk-backend-prod/src/models/ai.schema.ts`     → ChatMessageSchema (for Transcript)
 *
 * Key fix: `CallLog.transcript` was typed as `any`.
 * The backend stores transcripts as an array of `ChatMessage` objects.
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * A single conversational turn, aligned with `ChatMessageSchema` on the backend.
 */
export interface TranscriptMessage {
  role: "user" | "ai" | "system";
  text: string;
}

/**
 * A call log entry as returned by GET /analytics/calls and GET /analytics/calls/:id.
 * Aligned with the `call_logs` Postgres table.
 */
export interface CallLog {
  id: string;
  session_id: string;
  /** Full conversation transcript as structured messages (NOT a raw string). */
  transcript: TranscriptMessage[];
  summary: string;
  sentiment_score: number;
  duration_seconds: number;
  created_at: string;
}

/**
 * Aggregate statistics returned by GET /analytics/calls/stats.
 */
export interface CallStats {
  total_calls: number;
  avg_duration_seconds: number;
  avg_sentiment_score: number;
  calls_today: number;
  calls_this_week: number;
  leads_count: number;
  conversion_rate: string;
  revenue: string;
  hot_leads: CallLog[];
}

/** Typed success responses */
export type CallLogListResponse = ApiSuccessResponse<CallLog[]>;
export type CallLogDetailResponse = ApiSuccessResponse<CallLog>;
export type CallStatsResponse = ApiSuccessResponse<CallStats>;
