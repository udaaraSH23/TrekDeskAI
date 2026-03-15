/**
 * @file tour.types.ts
 * @description Type definitions for the Tours/Treks feature.
 * Strictly aligned with the backend's `Treks` table schema.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/trek.schema.ts`
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * Valid difficulty levels accepted by the backend validator.
 */
export type DifficultyLevel = "easy" | "moderate" | "challenging" | "extreme";

/**
 * Representation of a pax-based pricing bracket.
 */
export interface PricingTier {
  /** The group size range string (e.g. "1", "2-3", "4+"). */
  pax_range: string;
  /** The minimum per-person price for this bracket. */
  min_price: number;
  /** The maximum per-person price for this bracket. */
  max_price: number;
}

/**
 * The core Trek entity interface.
 * Mirrors the Postgres `treks` table columns (snake_case).
 */
export interface Trek {
  /** UUID of the trek record. */
  id: string;
  /** UUID of the tenant owner. */
  tenant_id: string;
  /** Public name of the tour. */
  name: string;
  /** Long-form description for AI reasoning and customer display. */
  description?: string;
  /** The starting price point per person. */
  base_price_per_person: number;
  /** Fixed cost for transportation. */
  transport_fee: number;
  /** Complexity indicator. */
  difficulty_level?: DifficultyLevel;
  /** Publication status. */
  is_active: boolean;
  /** Optional collection of volume-based pricing discounts. */
  pricing_tiers?: PricingTier[];
  /** Audit: ISO 8601 creation timestamp. */
  created_at: string;
  /** Audit: ISO 8601 update timestamp. */
  updated_at: string;
}

/**
 * Payload requirements for creating a new trek.
 * Omits auto-generated fields like `id` and `tenant_id`.
 */
export interface CreateTrekPayload {
  name: string;
  description?: string;
  base_price_per_person: number;
  transport_fee?: number;
  difficulty_level?: DifficultyLevel;
  pricing_tiers?: PricingTier[];
}

/**
 * Payload for partial trek updates.
 */
export type UpdateTrekPayload = Partial<CreateTrekPayload>;

/** Standard API response envelope for a list of treks. */
export type TrekListResponse = ApiSuccessResponse<Trek[]>;
/** Standard API response envelope for a single trek. */
export type TrekResponse = ApiSuccessResponse<Trek>;
