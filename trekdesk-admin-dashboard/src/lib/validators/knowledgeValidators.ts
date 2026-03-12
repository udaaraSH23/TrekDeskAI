/**
 * @file knowledgeValidators.ts
 * @description Client-side Zod validation schemas for knowledge base forms.
 *
 * Mirrors the backend's validators in:
 *   `trekdesk-backend-prod/src/validators/knowledgeValidators.ts`
 *   `trekdesk-backend-prod/src/models/knowledge.schema.ts`
 *
 * By validating client-side first:
 *  - The "Content must be at least 10 characters" error appears instantly as the
 *    user types, rather than after a slow embedding API call fails.
 *  - Invalid UUIDs for trek_id are caught before hitting the server.
 *
 * NOTE: Uses Zod v4 API.
 */

import { z } from "zod";

/**
 * Validates the payload for ingesting a new knowledge document.
 * Mirrors `KnowledgeDocumentSchema` from `knowledge.schema.ts` on the backend.
 */
export const ingestKnowledgeSchema = z.object({
  content: z
    .string("Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content is too long (max 50,000 characters)"),

  trek_id: z
    .string()
    .uuid("Must be a valid Trek ID (UUID format)")
    .nullable()
    .optional(),

  metadata: z.record(z.string(), z.string()).optional(),
});

export type KnowledgeIngestFormValues = z.infer<typeof ingestKnowledgeSchema>;

/**
 * Validates the knowledge base search query.
 * Mirrors `KnowledgeSearchQuerySchema` on the backend.
 */
export const knowledgeSearchSchema = z.object({
  q: z
    .string("Search query is required")
    .min(3, "Search query must be at least 3 characters")
    .max(500, "Search query is too long"),
});

export type KnowledgeSearchFormValues = z.infer<typeof knowledgeSearchSchema>;
