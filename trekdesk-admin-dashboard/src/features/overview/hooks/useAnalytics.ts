/**
 * @file useAnalytics.ts
 * @description React Query hooks for interacting with the Analytics and Call Log system.
 * Provides high-level data orchestration for the Dashboard Overview and Log Viewer.
 *
 * @module AnalyticsHooks
 * @category Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnalyticsService } from "../services/AnalyticsService";

/**
 * Custom hook to fetch aggregate call statistics for the dashboard overview.
 * Summarizes total volume, lead generation counts, and performance metrics.
 *
 * @returns {UseQueryResult<CallStats>} TanStack Query result containing the call stats.
 */
export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: AnalyticsService.getStats,
  });
};

/**
 * Custom hook to fetch the complete history of interactive call sessions.
 * Automatically scopes results to the authenticated tenant.
 *
 * @returns {UseQueryResult<CallLog[]>} TanStack Query result containing an array of call logs.
 */
export const useCallLogs = () => {
  return useQuery({
    queryKey: ["analytics", "logs"],
    queryFn: AnalyticsService.getCallLogs,
  });
};

/**
 * Custom hook to retrieve a detailed trace of a specific call session.
 * This includes the raw conversational transcript and generated AI summaries.
 *
 * @param id - The unique UUID identifier of the call log.
 * @returns {UseQueryResult<CallLog>} TanStack Query result containing the detailed call log.
 */
export const useCallLogDetails = (id: string) => {
  return useQuery({
    queryKey: ["analytics", "logs", id],
    queryFn: () => AnalyticsService.getCallDetail(id),
    enabled: !!id,
  });
};

/**
 * Custom hook to permanently remove a call record from the analytics history.
 * Automatically invalidates relevant query caches to ensure UI consistency.
 *
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useDeleteCallLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AnalyticsService.deleteLog(id),
    onSuccess: () => {
      // Refresh logs list and aggregated stats after deletion
      queryClient.invalidateQueries({ queryKey: ["analytics", "logs"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "stats"] });
    },
  });
};
