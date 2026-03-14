import {
  KnowledgeIngestDTO,
  KnowledgeSearchDTO,
  KnowledgeSearchResultDTO,
  UpdateKnowledgeDTO,
  DeleteKnowledgeDTO,
} from "../../dtos/KnowledgeDTO";

/**
 * Interface representing the business logic layer for Knowledge Base operations.
 * Handles the ingestion of new data and the retrieval of context for the AI.
 */
export interface IKnowledgeService {
  /**
   * Processes and ingests a new document into the vector database.
   * Typically involves chunking the text and generating embeddings.
   *
   * @param data - The KnowledgeIngestDTO containing the content and optional metadata.
   * @returns A Promise resolving when ingestion is complete.
   */
  ingestDocument(data: KnowledgeIngestDTO): Promise<void>;

  /**
   * Performs a semantic search against the ingested knowledge base to find relevant context.
   *
   * @param data - The KnowledgeSearchDTO containing the active search string.
   * @param limit - Optional maximum number of relevant chunks to return (default applied in implementation).
   * @returns A Promise resolving to an array of relevant text segments with metadata.
   */
  search(
    data: KnowledgeSearchDTO,
    limit?: number,
  ): Promise<KnowledgeSearchResultDTO[]>;

  /**
   * Updates an existing knowledge chunk.
   * This involves re-calculating the vector embedding for the new content.
   *
   * @param data - The UpdateKnowledgeDTO.
   */
  updateKnowledge(data: UpdateKnowledgeDTO): Promise<void>;

  /**
   * Removes a knowledge chunk from the vector database.
   *
   * @param data - The DeleteKnowledgeDTO.
   */
  deleteKnowledge(data: DeleteKnowledgeDTO): Promise<void>;

  /**
   * Retrieves all knowledge chunks for a specific tenant.
   *
   * @param tenantId - The UUID of the tenant.
   * @returns A Promise resolving to an array of all chunks.
   */
  getAllChunks(tenantId: string): Promise<KnowledgeSearchResultDTO[]>;
}
