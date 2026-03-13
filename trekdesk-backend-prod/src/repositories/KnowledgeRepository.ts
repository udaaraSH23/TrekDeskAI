/**
 * @file KnowledgeRepository.ts
 * @description Data access logic for managing vectorized knowledge base chunks.
 */
import { query } from "../config/database";
import { IKnowledgeRepository } from "../interfaces/repositories/IKnowledgeRepository";
import {
  InsertDocumentChunkPayload,
  SemanticSearchPayload,
  UpdateKnowledgeChunkPayload,
  DeleteKnowledgePayload,
  KnowledgeSearchResult,
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
  public async semanticSearch(
    data: SemanticSearchPayload,
  ): Promise<KnowledgeSearchResult[]> {
    const limit = data.limit ?? 3;
    const result = await query(
      `SELECT id, content, trek_id, (1 - (embedding <=> $2)) as similarity 
       FROM document_chunks 
       WHERE tenant_id = $1
       ORDER BY embedding <=> $2 
       LIMIT $3`,
      [data.tenantId, `[${data.embedding.join(",")}]`, limit],
    );

    return result.rows;
  }

  /**
   * Updates an existing knowledge chunk in the database.
   */
  public async updateKnowledgeChunk(
    data: UpdateKnowledgeChunkPayload,
  ): Promise<void> {
    await query(
      `UPDATE document_chunks 
       SET content = $1, embedding = $2 
       WHERE id = $3 AND tenant_id = $4`,
      [
        data.content,
        `[${data.embedding.join(",")}]`,
        data.chunkId,
        data.tenantId,
      ],
    );
  }

  /**
   * Deletes a specific knowledge chunk from the database.
   */
  public async deleteKnowledgeChunk(
    data: DeleteKnowledgePayload,
  ): Promise<void> {
    const { chunkId, tenantId } = data;
    await query(
      "DELETE FROM document_chunks WHERE id = $1 AND tenant_id = $2",
      [chunkId, tenantId],
    );
  }

  /**
   * Retrieves all knowledge chunks for a specific tenant.
   */
  public async listAllChunks(
    tenantId: string,
  ): Promise<KnowledgeSearchResult[]> {
    const result = await query(
      "SELECT id, content, trek_id FROM document_chunks WHERE tenant_id = $1 ORDER BY created_at DESC",
      [tenantId],
    );
    return result.rows;
  }
}
