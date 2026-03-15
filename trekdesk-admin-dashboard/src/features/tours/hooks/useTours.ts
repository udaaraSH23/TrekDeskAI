/**
 * @file useTours.ts
 * @description custom hooks for Trek/Tour operations using TanStack Query.
 * Handles server state synchronization, cache invalidation, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TourService, type Trek } from "../services/TourService";

/**
 * Hook: useTours
 * Fetches the complete list of treks for the current tenant.
 *
 * @returns {UseQueryResult} Array of Trek entities.
 */
export const useTours = () => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: TourService.getTours,
  });
};

/**
 * Hook: useTour
 * Fetches a specific trek detail by its unique UUID.
 *
 * @param id - The UUID of the trek to retrieve.
 * @returns {UseQueryResult} Single Trek entity.
 */
export const useTour = (id: string) => {
  return useQuery({
    queryKey: ["tours", id],
    queryFn: () => TourService.getTourById(id),
    enabled: !!id, // Only run if ID is valid
  });
};

/**
 * Hook: useCreateTour
 * Mutation to create a new trek.
 * Automatically invalidates the "tours" list to trigger a refetch.
 *
 * @returns {UseMutationResult}
 */
export const useCreateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TourService.createTour,
    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};

/**
 * Hook: useUpdateTour
 * Mutation to update an existing trek's properties.
 * Updates both the collection list and the individual entity cache.
 *
 * @returns {UseMutationResult}
 */
export const useUpdateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tour }: { id: string; tour: Partial<Trek> }) =>
      TourService.updateTour(id, tour),
    onSuccess: (updatedTour) => {
      // Invalidate list to ensure consistency across the app
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      // Optistically/Directly update the single item cache
      queryClient.setQueryData(["tours", updatedTour.id], updatedTour);
    },
  });
};

/**
 * Hook: useDeleteTour
 * Mutation to permanently remove a trek.
 * Invalidates the master list on success.
 *
 * @returns {UseMutationResult}
 */
export const useDeleteTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TourService.deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};
