/**
 * @file AnalyticsService.ts
 * @description Service for retrieving call logs and analytical data.
 *
 * Types are imported from `src/types/analytics.types.ts`.
 *
 * Key fixes from the old local interface:
 *  - `transcript: any` → `transcript: TranscriptMessage[]` (structured messages)
 *  - `getStats()` return was `any` → now typed `CallStats`
 */

import api from "../../../services/api";
import type {
  CallLog,
  CallStats,
  CallLogListResponse,
  CallLogDetailResponse,
  CallStatsResponse,
} from "../types/analytics.types";

// Re-export for backward compatibility during transition
export type { CallLog };

export const AnalyticsService = {
  /**
   * Retrieves all call logs for the authenticated tenant.
   * @returns A promise that resolves to an array of call logs.
   * @throws {ApiError} If the API request fails.
   */
  getCallLogs: async (): Promise<CallLog[]> => {
    const response = await api.get<CallLogListResponse>("/analytics/calls");
    return response.data.data;
  },

  /**
   * Retrieves aggregate call statistics for the dashboard overview.
   * @returns A promise that resolves to the aggregate call statistics.
   * @throws {ApiError} If the API request fails.
   */
  getStats: async (): Promise<CallStats> => {
    const response = await api.get<CallStatsResponse>("/analytics/calls/stats");
    return response.data.data;
  },

  /**
   * Retrieves a single call log with its full transcript.
   * @param id - The unique identifier of the call log.
   * @returns A promise that resolves to the detailed call log.
   * @throws {ApiError} If the API request fails or the log is not found.
   */
  getCallDetail: async (id: string): Promise<CallLog> => {
    const response = await api.get<CallLogDetailResponse>(
      `/analytics/calls/${id}`,
    );
    return response.data.data;
  },

  /**
   * Deletes a specific call log.
   * @param id - The unique identifier of the call log to delete.
   * @returns A promise that resolves when the log is deleted.
   * @throws {ApiError} If the API request fails.
   */
  deleteLog: async (id: string): Promise<void> => {
    await api.delete(`/analytics/calls/${id}`);
  },
};
