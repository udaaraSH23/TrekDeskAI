import {
  DeleteKnowledgePayload,
  KnowledgeDocument,
  KnowledgeSearchQuery,
  UpdateKnowledgeServicePayload,
  KnowledgeSearchResult,
} from "../../models/knowledge.schema";

/**
 * Interface representing the business logic layer for Knowledge Base operations.
 * Handles the ingestion of new data and the retrieval of context for the AI.
 */
export interface IKnowledgeService {
  /**
   * Processes and ingests a new document into the vector database.
   * Typically involves chunking the text and generating embeddings.
   *
   * @param data - The KnowledgeDocument DTO containing the content and optional metadata.
   * @returns A Promise resolving when ingestion is complete.
   */
  ingestDocument(data: KnowledgeDocument): Promise<void>;

  /**
   * Performs a semantic search against the ingested knowledge base to find relevant context.
   *
   * @param data - The KnowledgeSearchQuery DTO containing the active search string.
   * @param limit - Optional maximum number of relevant chunks to return (default applied in implementation).
   * @returns A Promise resolving to an array of relevant text segments with metadata.
   */
  search(
    data: KnowledgeSearchQuery,
    limit?: number,
  ): Promise<KnowledgeSearchResult[]>;

  /**
   * Updates an existing knowledge chunk.
   * This involves re-calculating the vector embedding for the new content.
   *
   * @param data - The UpdateKnowledgeServicePayload DTO.
   */
  updateKnowledge(data: UpdateKnowledgeServicePayload): Promise<void>;

  /**
   * Removes a knowledge chunk from the vector database.
   *
   * @param data - The DeleteKnowledgePayload DTO.
   */
  deleteKnowledge(data: DeleteKnowledgePayload): Promise<void>;

  /**
   * Retrieves all knowledge chunks for a specific tenant.
   *
   * @param tenantId - The UUID of the tenant.
   * @returns A Promise resolving to an array of all chunks.
   */
  getAllChunks(tenantId: string): Promise<KnowledgeSearchResult[]>;
}
