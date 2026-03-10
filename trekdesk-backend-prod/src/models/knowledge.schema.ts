import { z } from "zod";

/**
 * Zod schema defining the structural boundary of a text chunk intended for AI vectorization.
 * Enforces character limits and strict property types before triggering an embedding request.
 */
export const KnowledgeDocumentSchema = z.object({
  /** The actual text content/information to be stored */
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(50000, "Content is too long"),
  /** Optional UUID of a specific trek this knowledge should be scoped to */
  trek_id: z.string().uuid("Invalid Trek ID format").nullable().optional(),
  /** Arbitrary key-value metadata for filtering or descriptive purposes */
  metadata: z.record(z.string(), z.any()).optional(),
});
export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;

/**
 * Zod schema defining the core shape of a semantic search query.
 */
export const KnowledgeSearchQuerySchema = z.object({
  /** The search string to query the vector database */
  q: z.string().min(3, "Search query must be at least 3 characters").max(500),
});
export type KnowledgeSearchQuery = z.infer<typeof KnowledgeSearchQuerySchema>;

/**
 * DTO for inserting a document chunk into the vector database.
 */
export const InsertDocumentChunkPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  trekId: z.string().uuid().nullable().optional(),
  content: z.string(),
  embedding: z.array(z.number()),
  metadata: z.any().optional(),
});
export type InsertDocumentChunkPayload = z.infer<
  typeof InsertDocumentChunkPayloadSchema
>;

/**
 * DTO for performing a semantic search in the vector database.
 */
export const SemanticSearchPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  embedding: z.array(z.number()),
  limit: z.number().int().positive().optional(),
});
export type SemanticSearchPayload = z.infer<typeof SemanticSearchPayloadSchema>;
