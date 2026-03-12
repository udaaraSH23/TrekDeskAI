/**
 * @file tourValidators.ts
 * @description Client-side Zod validation schemas for tour/trek forms.
 *
 * These schemas mirror the backend's validators in:
 *   `trekdesk-backend-prod/src/validators/tourValidators.ts`
 *   `trekdesk-backend-prod/src/models/trek.schema.ts`
 *
 * By validating on the client first, we:
 *  1. Show inline field errors immediately (no round-trip to the server)
 *  2. Prevent wasted network requests for obviously invalid data
 *  3. Keep error messages consistent with what the backend would return
 *
 * NOTE: Uses Zod v4 API. In v4, `required_error` / `invalid_type_error`
 * params were unified into a single `error` parameter.
 *
 * Usage with react-hook-form + @hookform/resolvers:
 * ```ts
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { createTrekSchema } from '../lib/validators/tourValidators';
 * const form = useForm({ resolver: zodResolver(createTrekSchema) });
 * ```
 *
 * Or for manual validation:
 * ```ts
 * const result = createTrekSchema.safeParse(formData);
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors;
 * }
 * ```
 */

import { z } from "zod";

/**
 * Validates the payload for creating a new trek.
 * Mirrors `TrekSchema` from `trek.schema.ts` on the backend.
 */
export const createTrekSchema = z.object({
  name: z
    .string("Trek name is required")
    .min(3, "Trek name must be at least 3 characters")
    .max(255, "Trek name is too long"),

  description: z.string().optional(),

  base_price_per_person: z
    .number("Price must be a number")
    .positive("Price must be greater than 0"),

  transport_fee: z
    .number("Transport fee must be a number")
    .nonnegative("Transport fee cannot be negative")
    .default(0),

  difficulty_level: z
    .enum(["easy", "moderate", "challenging", "extreme"])
    .optional(),
});

export type CreateTrekFormValues = z.infer<typeof createTrekSchema>;

/**
 * Validates the payload for updating an existing trek.
 * All fields are optional (partial update).
 */
export const updateTrekSchema = createTrekSchema.partial();
export type UpdateTrekFormValues = z.infer<typeof updateTrekSchema>;
