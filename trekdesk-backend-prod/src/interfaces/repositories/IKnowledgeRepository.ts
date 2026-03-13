import {
  InsertDocumentChunkPayload,
  SemanticSearchPayload,
  UpdateKnowledgeChunkPayload,
  DeleteKnowledgePayload,
  KnowledgeSearchResult,
} from "../../models/knowledge.schema";

/**
 * Interface definition for the Vector Knowledge Base repository.
 * Handles specialized database interactions for semantic embeddings.
 */
export interface IKnowledgeRepository {
  /**
   * Persists a document text chunk alongside its calculated dense vector embedding.
   *
   * @param data - DTO linking content, embeddings, and tenant scoping.
   * @returns A Promise resolving upon successful insertion.
   */
  insertDocumentChunk(data: InsertDocumentChunkPayload): Promise<void>;

  /**
   * Queries the vector database to locate text segments semantically similar to an input vector.
   *
   * @param data - DTO housing the query vector, strict tenant limits, and result constraints.
   * @returns A Promise resolving to an array of matched text segments with metadata.
   */
  semanticSearch(data: SemanticSearchPayload): Promise<KnowledgeSearchResult[]>;
  /**
   * Updates an existing knowledge chunk and its vector representation.
   *
   * @param data - DTO containing update parameters.
   */
  updateKnowledgeChunk(data: UpdateKnowledgeChunkPayload): Promise<void>;
  /**
   * Deletes a knowledge chunk based on ID and tenant ownership.
   *
   * @param data - Target identity identity (chunkId and tenantId).
   */
  deleteKnowledgeChunk(data: DeleteKnowledgePayload): Promise<void>;

  /**
   * Retrieves all knowledge chunks for a specific tenant.
   *
   * @param tenantId - The UUID of the tenant.
   * @returns A Promise resolving to an array of all chunks.
   */
  listAllChunks(tenantId: string): Promise<KnowledgeSearchResult[]>;
}
