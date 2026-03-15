/**
 * @file usePersona.ts
 * @description specialized hooks for managing AI Persona server state using TanStack Query.
 * Includes data fetching, caching, and optimistic-style cache updates for the AI's
 * identity and behavior settings.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PersonaService,
  type PersonaSettings,
} from "../services/PersonaService";

/**
 * usePersonaSettings
 *
 * Custom hook to fetch the current AI persona configuration from the backend.
 * Uses the ["persona", "settings"] query key for centralized cache management.
 *
 * @returns {UseQueryResult<PersonaSettings>} The reactive query result containing
 * settings, loading states, and error information.
 */
export const usePersonaSettings = () => {
  return useQuery({
    queryKey: ["persona", "settings"],
    queryFn: PersonaService.getSettings,
    // Provide a small staleTime to prevent excessive refetching during UI navigation
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * useUpdatePersonaSettings
 *
 * Custom hook to update the AI persona configuration.
 * Rather than invalidating the entire query (which causes a loading flicker),
 * it directly updates the TanStack Query cache with the server response
 * for a near-instantaneous UI update.
 *
 * @returns {UseMutationResult<PersonaSettings, Error, PersonaSettings>}
 */
export const useUpdatePersonaSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PersonaSettings) =>
      PersonaService.updateSettings(settings),

    /**
     * Cache Synchronization
     * On a successful save, we manually update the 'settings' cache entry
     * to reflect the new state returned by the server. This ensures that
     * all components consuming usePersonaSettings() stay perfectly in sync.
     */
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["persona", "settings"], updatedSettings);
    },
  });
};
