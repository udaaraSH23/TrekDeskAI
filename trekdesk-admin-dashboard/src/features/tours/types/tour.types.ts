/**
 * @file tour.types.ts
 * @description Frontend trek/tour types aligned with the backend's `TrekSchema`.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/trek.schema.ts → TrekSchema`
 *
 * IMPORTANT — Field name alignment:
 * The previous local `Trek` interface in TourService.ts used the wrong casing:
 *   ❌ `basePrice`   → ✅ `base_price_per_person`
 *   ❌ `durationDays` → removed (not in backend schema)
 *   ❌ `difficulty`  → ✅ `difficulty_level`
 *   ❌ `isActive`    → ✅ `is_active`
 *
 * These are the actual column names from the Postgres `treks` table.
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * The difficulty levels accepted by the backend.
 * Mirrors the Zod enum in TrekSchema.
 */
export type DifficultyLevel = "easy" | "moderate" | "challenging" | "extreme";

/**
 * A trek entity as returned by the backend.
 * Aligned with the Postgres `treks` table columns.
 */
export interface Trek {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  base_price_per_person: number;
  transport_fee: number;
  difficulty_level?: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * The payload sent to POST /tours to create a new trek.
 * Matches `CreateTrekPayloadSchema` on the backend.
 */
export interface CreateTrekPayload {
  name: string;
  description?: string;
  base_price_per_person: number;
  transport_fee?: number;
  difficulty_level?: DifficultyLevel;
}

/**
 * The payload for PATCH/PUT /tours/:id.
 * All fields are optional for partial updates.
 */
export type UpdateTrekPayload = Partial<CreateTrekPayload>;

/** Typed success response for list endpoint */
export type TrekListResponse = ApiSuccessResponse<Trek[]>;
/** Typed success response for single entity endpoints */
export type TrekResponse = ApiSuccessResponse<Trek>;
