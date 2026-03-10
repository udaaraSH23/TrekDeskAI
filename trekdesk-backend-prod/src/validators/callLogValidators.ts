/**
 * @file callLogValidators.ts
 * @description Zod validation schemas for Call Log management.
 * These schemas validate parameters for retrieving call history and specific interaction logs.
 */

import { z } from "zod";
import { CallLogSchema } from "../models/logs.schema";

/**
 * Validation schema for retrieving specific call log details.
 * Ensures the logId provided in the URL parameters follows the UUID standard.
 */
export const getLogDetailSchema = z.object({
  params: z.object({
    /** Unique UUID of the call log to retrieve */
    logId: CallLogSchema.shape.id,
  }),
});
