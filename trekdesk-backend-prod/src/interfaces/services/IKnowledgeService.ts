import {
  KnowledgeDocument,
  KnowledgeSearchQuery,
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
   * @returns A Promise resolving to an array of relevant text strings.
   */
  search(data: KnowledgeSearchQuery, limit?: number): Promise<string[]>;
}
