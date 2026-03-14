/**
 * @file chatValidators.ts
 * @description Zod validation schemas for Chat-related requests.
 */

import { z } from "zod";

/**
 * Validator for the chat message endpoint.
 * Ensures the body contains a valid tenantId and a non-empty message.
 */
export const chatMessageSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid({ message: "Invalid tenant ID format" }),
    message: z
      .string()
      .min(1, { message: "Message cannot be empty" })
      .max(2000, { message: "Message too long" }),
  }),
});
