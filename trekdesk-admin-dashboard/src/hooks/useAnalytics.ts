import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "../services/AnalyticsService";

/**
 * Custom hook to fetch aggregate call statistics for the dashboard overview.
 * @returns {UseQueryResult} TanStack Query result containing the call stats.
 */
export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: AnalyticsService.getStats,
  });
};

/**
 * Custom hook to fetch all call logs for the authenticated tenant.
 * @returns {UseQueryResult} TanStack Query result containing an array of call logs.
 */
export const useCallLogs = () => {
  return useQuery({
    queryKey: ["analytics", "logs"],
    queryFn: AnalyticsService.getCallLogs,
  });
};

/**
 * Custom hook to fetch a single call log with its full transcript.
 * @param id - The unique identifier of the call log.
 * @returns {UseQueryResult} TanStack Query result containing the detailed call log.
 */
export const useCallLogDetails = (id: string) => {
  return useQuery({
    queryKey: ["analytics", "logs", id],
    queryFn: () => AnalyticsService.getCallDetail(id),
    enabled: !!id,
  });
};
