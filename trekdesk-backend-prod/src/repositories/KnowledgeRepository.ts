/**
 * @file KnowledgeRepository.ts
 * @description Data access logic for managing vectorized knowledge base chunks.
 */
import { query } from "../config/database";
import { IKnowledgeRepository } from "../interfaces/repositories/IKnowledgeRepository";
import {
  InsertDocumentChunkPayload,
  SemanticSearchPayload,
} from "../models/knowledge.schema";

/**
 * Repository implementation for managing vectorized knowledge documents.
 * Utilizes pgvector extension within PostgreSQL for generative AI search.
 */
export class KnowledgeRepository implements IKnowledgeRepository {
  /**
   * Inserts a vectorized document chunk into the database.
   * The embedding vector is permanently stored for rapid cosine distance searching.
   *
   * @param data - The InsertDocumentChunkPayload DTO containing tenant routing, content, and the vector embedding.
   * @returns A Promise resolving when the persistence is complete.
   */
  public async insertDocumentChunk(
    data: InsertDocumentChunkPayload,
  ): Promise<void> {
    await query(
      `INSERT INTO document_chunks (tenant_id, trek_id, content, embedding, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.tenantId,
        data.trekId,
        data.content,
        `[${data.embedding.join(",")}]`,
        JSON.stringify(data.metadata),
      ],
    );
  }

  /**
   * Performs a vector similarity search (Cosine Distance) to find relevant knowledge chunks.
   */
  public async semanticSearch(data: SemanticSearchPayload): Promise<string[]> {
    const limit = data.limit ?? 3;
    const result = await query(
      `SELECT content FROM document_chunks 
       WHERE tenant_id = $1
       ORDER BY embedding <=> $2 
       LIMIT $3`,
      [data.tenantId, `[${data.embedding.join(",")}]`, limit],
    );

    return result.rows.map((row: { content: string }) => row.content);
  }
}
