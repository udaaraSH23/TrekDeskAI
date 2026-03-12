/**
 * @file KnowledgeService.ts
 * @description Service for managing RAG knowledge base ingestion and semantic search.
 *
 * Types are imported from `src/types/knowledge.types.ts` which is aligned with
 * the backend's `KnowledgeDocumentSchema` and `KnowledgeSearchQuerySchema`.
 *
 * Key fixes from the old local interface:
 *  - `metadata?: any` → `metadata?: Record<string, string>` (properly typed)
 *  - `ingest()` return was `any` → now `KnowledgeIngestResponse['data']`
 *  - `search()` return was `string[]` → now `KnowledgeSearchResult[]`
 */

import api from "./api";
import type {
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeIngestResponse,
  KnowledgeSearchResponse,
} from "../types/knowledge.types";

// Re-export for backward compatibility during transition
export type { KnowledgeDocument };

export const KnowledgeService = {
  /**
   * Ingests a document chunk into the AI's knowledge base.
   * The content is vectorized and stored for semantic retrieval.
   *
   * @param data - The knowledge document to ingest. Must satisfy `KnowledgeDocument`.
   *               Validated client-side by `src/lib/validators/knowledgeValidators.ts`.
   * @returns A promise resolving to a success message.
   * @throws {ApiError} If ingestion fails.
   */
  ingest: async (data: KnowledgeDocument): Promise<{ message: string }> => {
    const response = await api.post<KnowledgeIngestResponse>(
      "/knowledge/ingest",
      data,
    );
    return response.data.data;
  },

  /**
   * Performs a semantic similarity search over the knowledge base.
   * @param query - The natural language search query (min 3 chars, max 500).
   * @returns A promise resolving to an array of search results.
   * @throws {ApiError} If the search fails.
   */
  search: async (query: string): Promise<KnowledgeSearchResult[]> => {
    const response = await api.get<KnowledgeSearchResponse>(
      `/knowledge/search?q=${encodeURIComponent(query)}`,
    );
    return response.data.data;
  },
};
