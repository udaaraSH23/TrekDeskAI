import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TourService, type Trek } from "../services/TourService";

/**
 * Custom hook to fetch all treks for the authenticated tenant.
 * @returns {UseQueryResult} TanStack Query result containing an array of treks.
 */
export const useTours = () => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: TourService.getTours,
  });
};

/**
 * Custom hook to fetch a single trek by its ID.
 * @param id - The UUID of the trek.
 * @returns {UseQueryResult} TanStack Query result containing the trek entity.
 */
export const useTour = (id: string) => {
  return useQuery({
    queryKey: ["tours", id],
    queryFn: () => TourService.getTourById(id),
    enabled: !!id,
  });
};

/**
 * Custom hook to create a new trek offering.
 * Invalidates the "tours" list cache on success.
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useCreateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TourService.createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};

/**
 * Custom hook to update an existing trek.
 * Invalidates the "tours" list and sets the individual trek data on success.
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useUpdateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tour }: { id: string; tour: Partial<Trek> }) =>
      TourService.updateTour(id, tour),
    onSuccess: (updatedTour) => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.setQueryData(["tours", updatedTour.id], updatedTour);
    },
  });
};

/**
 * Custom hook to delete a trek permanently.
 * Invalidates the "tours" list on success.
 * @returns {UseMutationResult} TanStack Query mutation result.
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
