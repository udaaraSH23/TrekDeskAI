import {
  InsertDocumentChunkPayload,
  SemanticSearchPayload,
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
   * @returns A Promise resolving to an array of raw matched text strings.
   */
  semanticSearch(data: SemanticSearchPayload): Promise<string[]>;
}
