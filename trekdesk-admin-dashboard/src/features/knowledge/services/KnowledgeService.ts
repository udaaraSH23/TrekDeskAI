/**
 * @file KnowledgeService.ts
 * @description Core API service for the Retrieval Augmented Generation (RAG) system.
 * Manages the lifecycle of knowledge documents from ingestion to semantic search.
 *
 * @module KnowledgeServices
 * @category Services
 */

import api from "../../../services/api";
import type {
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeIngestResponse,
  KnowledgeSearchResponse,
  UpdateKnowledgePayload,
  KnowledgeUpdateResponse,
} from "../types/knowledge.types";

/**
 * Service for interfacing with the backend /knowledge API endpoints.
 * Handles vector storage, retrieval, and management of AI knowledge chunks.
 */
export const KnowledgeService = {
  /**
   * Ingests a new document or text chunk into the AI's knowledge base.
   * The content is automatically vectorized (embedded) using Gemini models
   * and stored in the PostgreSQL vector store for later retrieval.
   *
   * @param data - The knowledge document object containing raw text content.
   * @returns {Promise<{ message: string }>} A promise resolving to a confirmation message.
   * @throws {Error} If the network request fails or validation rejects the content.
   */
  ingest: async (data: KnowledgeDocument): Promise<{ message: string }> => {
    const response = await api.post<KnowledgeIngestResponse>(
      "/knowledge/ingest",
      data,
    );
    return response.data.data;
  },

  /**
   * Performs a semantic similarity search (vector search) over the knowledge base.
   * Unlike keyword search, this finds relevant content based on meaning and intent.
   *
   * @param query - The natural language question or keywords to search for.
   * @returns {Promise<KnowledgeSearchResult[]>} A list of relevant chunks with similarity scores.
   * @throws {Error} If the backend search service is unavailable.
   */
  search: async (query: string): Promise<KnowledgeSearchResult[]> => {
    const response = await api.get<KnowledgeSearchResponse>(
      `/knowledge/search?q=${encodeURIComponent(query)}`,
    );
    return response.data.data;
  },

  /**
   * Updates the content of an existing knowledge chunk.
   * This triggers a re-vectorization process on the backend to ensure the AI
   * has the most accurate information.
   *
   * @param chunkId - UUID of the knowledge chunk to modify.
   * @param payload - The updated content and optional metadata.
   * @returns {Promise<{ message: string }>} Success confirmation from the server.
   * @throws {Error} If the chunk ID is invalid or the update fails.
   */
  updateKnowledge: async (
    chunkId: string,
    payload: UpdateKnowledgePayload,
  ): Promise<{ message: string }> => {
    const response = await api.patch<KnowledgeUpdateResponse>(
      `/knowledge/${chunkId}`,
      payload,
    );
    return response.data.data;
  },

  /**
   * Permanently removes a knowledge chunk from the vector database.
   * This information will no longer be available for the AI to reference.
   *
   * @param chunkId - UUID of the knowledge chunk to delete.
   * @returns {Promise<void>} Resolves when the deletion is finalized.
   * @throws {Error} If the deletion operation fails.
   */
  deleteKnowledge: async (chunkId: string): Promise<void> => {
    await api.delete(`/knowledge/${chunkId}`);
  },

  /**
   * Retrieves a comprehensive list of all knowledge records for the current tenant.
   * Useful for administrative overview and bulk management.
   *
   * @returns {Promise<KnowledgeSearchResult[]>} Array of all knowledge records indexed.
   * @throws {Error} If the backend fails to list the records.
   */
  listAll: async (): Promise<KnowledgeSearchResult[]> => {
    const response = await api.get<KnowledgeSearchResponse>("/knowledge");
    return response.data.data;
  },
};
