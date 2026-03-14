/**
 * @file knowledge.types.ts
 * @description Frontend knowledge base types aligned with the backend's `KnowledgeDocumentSchema`.
 *
 * Source of truth: `trekdesk-backend-prod/src/models/knowledge.schema.ts`
 *
 * Changes from the old local `KnowledgeIngest` interface:
 *  - `metadata?: any` → `metadata?: Record<string, string>` (properly typed)
 *  - Added `KnowledgeSearchResult` to replace the untyped `string[]` return
 */

import type { ApiSuccessResponse } from "../../../types/api.types";

/**
 * Payload for POST /knowledge/ingest.
 * Aligned with `KnowledgeDocumentSchema`.
 */
export interface KnowledgeDocument {
  /** The factual content to be vectorized and stored. Min 10 chars, max 50,000. */
  content: string;
  /** Optional UUID of a specific trek to scope this knowledge chunk to. */
  trek_id?: string | null;
  /** Arbitrary key-value metadata for filtering (values must be strings). */
  metadata?: Record<string, string>;
}

/**
 * A single result returned by the semantic search endpoint.
 * The backend returns content chunks with similarity scores.
 */
export interface KnowledgeSearchResult {
  id: string;
  content: string;
  trek_id?: string | null;
  metadata?: Record<string, string>;
  /** Cosine similarity score from the vector search (0–1) */
  similarity?: number;
}

/** Typed success response for ingest */
export type KnowledgeIngestResponse = ApiSuccessResponse<{ message: string }>;
/** Typed success response for search */
export type KnowledgeSearchResponse = ApiSuccessResponse<
  KnowledgeSearchResult[]
>;

/**
 * Payload for PATCH /knowledge/:chunkId.
 */
export interface UpdateKnowledgePayload {
  content: string;
}

/** Typed success response for update/delete */
export type KnowledgeUpdateResponse = ApiSuccessResponse<{ message: string }>;
