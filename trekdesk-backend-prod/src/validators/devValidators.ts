/**
 * @file devValidators.ts
 * @description Zod validation schemas for Developer diagnostic tools.
 */

import { z } from "zod";

/**
 * Validator for the test prompt endpoint.
 * Ensures a non-empty prompt is provided.
 */
export const testPromptSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, { message: "Prompt is required" }),
  }),
});
