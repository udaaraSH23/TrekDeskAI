/**
 * @module WidgetHooks
 * @category Hooks
 *
 * Contains React Query hooks for managing widget configuration state.
 * These hooks provide a declarative way to fetch and mutate widget settings.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { WidgetService } from "../services/WidgetService";
import type {
  WidgetSettings,
  UpdateWidgetSettingsPayload,
} from "../types/widget.types";

/**
 * Hook to fetch the current widget configuration from the backend.
 *
 * Uses TanStack Query for caching and state management. The "widget settings"
 * govern the appearance (colors, position) and behavior (welcome message)
 * of the customer-facing chat widget.
 *
 * @returns {UseQueryResult<WidgetSettings, Error>} Query result containing settings, loading state, and errors.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useWidgetSettings();
 * if (isLoading) return <Loading />;
 * return <div style={{ color: data.primary_color }}>{data.initial_message}</div>;
 * ```
 */
export const useWidgetSettings = (): UseQueryResult<WidgetSettings, Error> => {
  return useQuery({
    queryKey: ["widget", "settings"],
    queryFn: WidgetService.getSettings,
    // Settings are relatively static, so we can keep them fresh via manual invalidation
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update the widget configuration.
 *
 * This mutation updates the backend and then performs an optimistic-style update
 * by directly updating the 'widget settings' query cache. This ensures the
 * UI reflects the changes immediately without waiting for a full refetch.
 *
 * @returns {UseMutationResult<WidgetSettings, Error, UpdateWidgetSettingsPayload>} Mutation result object.
 *
 * @example
 * ```tsx
 * const mutation = useUpdateWidgetSettings();
 * const save = () => mutation.mutate({ primary_color: '#000000' });
 * ```
 */
export const useUpdateWidgetSettings = (): UseMutationResult<
  WidgetSettings,
  Error,
  UpdateWidgetSettingsPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateWidgetSettingsPayload) =>
      WidgetService.updateSettings(settings),

    /**
     * On successful update, sync the local cache with the response from the server.
     * This avoids an extra network request to 'getSettings'.
     */
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["widget", "settings"], updatedSettings);
    },
  });
};
