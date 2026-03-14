/**
 * @file trek.schema.ts
 * @description Zod schemas and TypeScript types for trek tour catalog entities.
 */
import { z } from "zod";

/**
 * Zod schema defining the baseline structural integrity of a Trek/Tour object.
 * Validates constraints like positive pricing and correct enumeration of difficulty constraints.
 * All fields map directly to columns within the Postgres `treks` catalog table.
 */
export const TrekSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  base_price_per_person: z.number().positive(),
  transport_fee: z.number().nonnegative().default(0),
  difficulty_level: z
    .enum(["easy", "moderate", "challenging", "extreme"])
    .optional(),
  pricing_tiers: z
    .array(
      z.object({
        pax_range: z.string(), // e.g. "1", "2", "3-4"
        min_price: z.number().positive(),
        max_price: z.number().positive(),
      }),
    )
    .optional(),
});

// Export the inferred TypeScript type defining a normalized Trek across the application.
export type Trek = z.infer<typeof TrekSchema>;

/**
 * DTO structure validating the inbound request for the creation of a new Trek offering.
 * Combines the basic Trek schema with the necessary tenant routing dimension (`tenantId`).
 */
export const CreateTrekPayloadSchema = TrekSchema.extend({
  tenantId: z.string().uuid(),
});
export type CreateTrekPayload = z.infer<typeof CreateTrekPayloadSchema>;

/**
 * Represents a saved Trek record in the database, including system-generated fields.
 */
export type TrekRecord = Trek & {
  id: string;
  tenant_id: string;
  created_at?: Date;
  updated_at?: Date;
};

/**
 * Payload for updating an existing Trek.
 * Makes all Trek fields optional using .partial()
 */
export const UpdateTrekPayloadSchema = TrekSchema.partial().extend({
  tenantId: z.string().uuid(),
  trekId: z.string().uuid(),
});
export type UpdateTrekPayload = z.infer<typeof UpdateTrekPayloadSchema>;

/**
 * DTO for deleting a trek (enforces tenant scoping).
 */
export const DeleteTrekPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  trekId: z.string().uuid(),
});
export type DeleteTrekPayload = z.infer<typeof DeleteTrekPayloadSchema>;
