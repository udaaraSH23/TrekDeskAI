import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { WidgetService } from "../services/WidgetService";
import type {
  WidgetSettings,
  UpdateWidgetSettingsPayload,
} from "../types/widget.types";

/**
 * Custom hook to fetch the current widget configuration.
 * @returns {UseQueryResult} TanStack Query result containing the widget settings.
 */
export const useWidgetSettings = (): UseQueryResult<WidgetSettings, Error> => {
  return useQuery({
    queryKey: ["widget", "settings"],
    queryFn: WidgetService.getSettings,
  });
};

/**
 * Custom hook to update the widget configuration.
 * Directly updates the query cache on success or invalidates to ensure fresh data.
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useUpdateWidgetSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateWidgetSettingsPayload) =>
      WidgetService.updateSettings(settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["widget", "settings"], updatedSettings);
    },
  });
};
