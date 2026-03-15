/**
 * @file IKnowledgeService.ts
 * @description Interface representing the business logic layer for Knowledge Base operations.
 * Orchestrates the full RAG lifecycle including text processing, embedding generation,
 * and semantic retrieval management.
 *
 * @module KnowledgeBase
 * @category Interfaces
 * @subcategory Services
 */

import {
  KnowledgeIngestDTO,
  KnowledgeSearchDTO,
  KnowledgeSearchResultDTO,
  UpdateKnowledgeDTO,
  DeleteKnowledgeDTO,
} from "../../dtos/KnowledgeDTO";

/**
 * IKnowledgeService Interface
 *
 * Defines the contract for services managing the Retrieval-Augmented Generation (RAG) system.
 * This layer sits between the controllers and repositories, handling complex logic like
 * vector transformation and multi-tenant scoping.
 */
export interface IKnowledgeService {
  /**
   * Processes and ingests a new document into the vector database.
   * Typically involves stripping metadata, chunking the text, and triggering
   * semantic embedding generation.
   *
   * @param data - The KnowledgeIngestDTO containing the raw text content.
   * @returns A Promise resolving when the indexing is complete.
   * @throws {BadRequestError} If the content is empty or invalid.
   */
  ingestDocument(data: KnowledgeIngestDTO): Promise<void>;

  /**
   * Performs a semantic search against the ingested knowledge base to find context for AI prompts.
   * Converts the search query string into a vector before executing a similarity search.
   *
   * @param data - The KnowledgeSearchDTO containing the user's active query string.
   * @param limit - Optional maximum number of relevant chunks to return (defaults to 5).
   * @returns A Promise resolving to an array of relevant text segments ranked by distance.
   */
  search(
    data: KnowledgeSearchDTO,
    limit?: number,
  ): Promise<KnowledgeSearchResultDTO[]>;

  /**
   * Updates an existing knowledge chunk and its corresponding vector.
   * This is critical when source documents are modified to maintain accurate AI retrieval.
   *
   * @param data - The UpdateKnowledgeDTO containing the target ID and new content.
   * @returns A Promise resolving upon successful re-indexing.
   */
  updateKnowledge(data: UpdateKnowledgeDTO): Promise<void>;

  /**
   * Permanently removes a knowledge chunk from the vector database.
   *
   * @param data - The DeleteKnowledgeDTO containing the target chunk ID.
   * @returns A Promise resolving upon successful removal.
   */
  deleteKnowledge(data: DeleteKnowledgeDTO): Promise<void>;

  /**
   * Retrieves a comprehensive list of all vectors/chunks belonging to a specific tenant.
   * Used primarily for administrative management and oversight.
   *
   * @param tenantId - The UUID of the tenant whose knowledge base is targeted.
   * @returns A Promise resolving to an array of all available knowledge segments.
   */
  getAllChunks(tenantId: string): Promise<KnowledgeSearchResultDTO[]>;
}
