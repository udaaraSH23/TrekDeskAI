import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PersonaService,
  type PersonaSettings,
} from "../services/PersonaService";

/**
 * Custom hook to fetch the current AI persona configuration.
 * @returns {UseQueryResult} TanStack Query result containing the persona settings.
 */
export const usePersonaSettings = () => {
  return useQuery({
    queryKey: ["persona", "settings"],
    queryFn: PersonaService.getSettings,
  });
};

/**
 * Custom hook to update the AI persona configuration.
 * Directly updates the query cache on success to avoid a refetch.
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useUpdatePersonaSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PersonaSettings) =>
      PersonaService.updateSettings(settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["persona", "settings"], updatedSettings);
    },
  });
};
