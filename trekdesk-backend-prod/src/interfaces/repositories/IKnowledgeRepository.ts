/**
 * @file IKnowledgeRepository.ts
 * @description Interface definition for the Vector Knowledge Base repository.
 * Handles low-level database interactions specifically tailored for PostgreSQL pgvector operations.
 *
 * @module KnowledgeBase
 * @category Interfaces
 * @subcategory Repositories
 */

import {
  InsertDocumentChunkDTO,
  SemanticSearchDTO,
  UpdateKnowledgeChunkDTO,
  DeleteKnowledgeDTO,
  KnowledgeSearchResultDTO,
} from "../../dtos/KnowledgeDTO";

/**
 * IKnowledgeRepository Interface
 *
 * Defines the contract for persistence components managing the Retrieval-Augmented
 * Generation (RAG) knowledge store. Implementations are responsible for mapping
 * between domain DTOs and vector-enabled SQL queries.
 */
export interface IKnowledgeRepository {
  /**
   * Persists a document text chunk alongside its calculated dense vector embedding.
   *
   * @param data - DTO linking content, embeddings, and tenant scoping.
   * @returns A Promise resolving upon successful insertion.
   * @throws {DatabaseError} If the write operation fails or vector dimensions mismatch.
   */
  insertDocumentChunk(data: InsertDocumentChunkDTO): Promise<void>;

  /**
   * Queries the vector database using cosine distance (<=> operator) to locate
   * text segments semantically similar to an input vector.
   *
   * @param data - DTO housing the query vector, strict tenant limits, and result constraints.
   * @returns A Promise resolving to an array of matched text segments with similarity scores.
   * @throws {DatabaseError} If the vector query syntax is invalid or database is unreachable.
   */
  semanticSearch(data: SemanticSearchDTO): Promise<KnowledgeSearchResultDTO[]>;

  /**
   * Updates the raw text and/or vector representation of an existing knowledge chunk.
   *
   * @param data - DTO containing update parameters including the new vector buffer.
   * @returns A Promise resolving upon successful persistence.
   */
  updateKnowledgeChunk(data: UpdateKnowledgeChunkDTO): Promise<void>;

  /**
   * Deletes a knowledge chunk based on ID and strict tenant ownership verification.
   *
   * @param data - Target identity (chunkId and tenantId).
   * @returns A Promise resolving upon successful deletion.
   */
  deleteKnowledgeChunk(data: DeleteKnowledgeDTO): Promise<void>;

  /**
   * Retrieves all knowledge chunks for a specific tenant, typically for administrative oversight.
   *
   * @param tenantId - The UUID of the tenant scope.
   * @returns A Promise resolving to an array of all chunks belonging to the tenant.
   */
  listAllChunks(tenantId: string): Promise<KnowledgeSearchResultDTO[]>;
}
