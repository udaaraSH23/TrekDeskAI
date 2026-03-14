/**
 * @file TourService.ts
 * @description Service for managing trekking tour itineraries.
 *
 * Types are imported from `src/types/tour.types.ts` which is aligned with
 * the backend's `TrekSchema` (trek.schema.ts).
 *
 * BREAKING CHANGE from the old local interface:
 *   Old field names (wrong): `basePrice`, `durationDays`, `difficulty`, `isActive`
 *   Correct field names:     `base_price_per_person`, `difficulty_level`, `is_active`
 */

import api from "../../../services/api";
import type {
  Trek,
  CreateTrekPayload,
  UpdateTrekPayload,
  TrekListResponse,
  TrekResponse,
} from "../types/tour.types";

// Re-export Trek so existing consumers continue to work during the transition
export type { Trek };

export const TourService = {
  /**
   * Retrieves all treks for the authenticated tenant.
   * @returns A promise resolving to an array of treks.
   * @throws {ApiError} If the API request fails.
   */
  getTours: async (): Promise<Trek[]> => {
    const response = await api.get<TrekListResponse>("/tours");
    return response.data.data;
  },

  /**
   * Retrieves a single trek by its ID.
   * @param id - The UUID of the trek.
   * @returns A promise resolving to the trek entity.
   * @throws {ApiError} If the trek is not found or the request fails.
   */
  getTourById: async (id: string): Promise<Trek> => {
    const response = await api.get<TrekResponse>(`/tours/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new trek offering.
   * @param payload - The trek creation data. Must satisfy `CreateTrekPayload`.
   *                  Validated client-side by `src/lib/validators/tourValidators.ts`.
   * @returns A promise resolving to the created trek.
   * @throws {ApiError} If creation fails.
   */
  createTour: async (payload: CreateTrekPayload): Promise<Trek> => {
    const response = await api.post<TrekResponse>("/tours", payload);
    return response.data.data;
  },

  /**
   * Updates an existing trek (partial update).
   * @param id      - UUID of the trek to update.
   * @param payload - Partial trek fields to update.
   * @returns A promise resolving to the updated trek.
   * @throws {ApiError} If update fails.
   */
  updateTour: async (id: string, payload: UpdateTrekPayload): Promise<Trek> => {
    const response = await api.patch<TrekResponse>(`/tours/${id}`, payload);
    return response.data.data;
  },

  /**
   * Permanently deletes a trek.
   * @param id - UUID of the trek to delete.
   * @returns A promise that resolves when the trek is deleted.
   * @throws {ApiError} If deletion fails.
   */
  deleteTour: async (id: string): Promise<void> => {
    await api.delete(`/tours/${id}`);
  },
};
