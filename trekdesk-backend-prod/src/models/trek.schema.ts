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
