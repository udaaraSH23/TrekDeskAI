/**
 * @file tourValidators.ts
 * @description Zod validation schemas for trek tour related requests.
 * These schemas ensure data integrity for creating and retrieving trek details.
 */

import { z } from "zod";

import { TrekSchema } from "../models/trek.schema";

/**
 * Validation schema for creating a new trek.
 * Uses the core `TrekSchema` from internal models as the source of truth.
 */
export const createTrekSchema = z.object({
  body: TrekSchema,
});

/**
 * Validation schema for retrieving specific trek details.
 * Ensures the trekId passed in URL parameters is a valid UUID.
 */
export const getTrekDetailSchema = z.object({
  params: z.object({
    /** UUID of the trek to retrieve detail for */
    trekId: z.string().uuid("Invalid Trek ID format"),
  }),
});

/**
 * Validation schema for updating a trek.
 */
export const updateTrekSchema = z.object({
  params: z.object({
    trekId: z.string().uuid("Invalid Trek ID format"),
  }),
  body: TrekSchema.partial(),
});

/**
 * Validation schema for deleting a trek.
 */
export const deleteTrekSchema = z.object({
  params: z.object({
    trekId: z.string().uuid("Invalid Trek ID format"),
  }),
});
