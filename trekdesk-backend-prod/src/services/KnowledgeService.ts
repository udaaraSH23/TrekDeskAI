/**
 * @file KnowledgeService.ts
 * @description RAG (Retrieval-Augmented Generation) service for handling domain-specific knowledge.
 * Manages document ingestion, vector embeddings, and semantic search capabilities.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { IKnowledgeRepository } from "../interfaces/repositories/IKnowledgeRepository";
import { IKnowledgeService } from "../interfaces/services/IKnowledgeService";
import { MVP_TENANT_ID } from "../config/constants";

/**
 * Initializes the Google Generative AI client with the provided API key.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Specifically uses the text-embedding-004 model for creating vector representations of text.
 */
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

import {
  KnowledgeDocument,
  KnowledgeSearchQuery,
} from "../models/knowledge.schema";

/**
 * Service class for knowledge base operations including ingestion and retrieval.
 */
export class KnowledgeService implements IKnowledgeService {
  constructor(private knowledgeRepository: IKnowledgeRepository) {}

  /**
   * Ingests a document by splitting it into smaller chunks and storing their vector embeddings.
   *
   * @param data - The DTO containing the knowledge document payload.
   * @returns A status object indicating success and the number of chunks processed.
   *
   * @note For the MVP, we use fixed-size chunking. Production systems should consider semantic splitting.
   */
  public async ingestDocument(data: KnowledgeDocument) {
    const chunks = this.simpleChunk(data.content, 1000); // Fixed 1000 chars per chunk

    console.log(`[KnowledgeService] Ingesting ${chunks.length} chunks...`);

    for (const chunk of chunks) {
      try {
        // Generate vector embedding for the current chunk
        const result = await embeddingModel.embedContent(chunk);
        const embedding = result.embedding.values;

        // Persist chunk and its embedding to the vector database via the repository
        await this.knowledgeRepository.insertDocumentChunk({
          tenantId: MVP_TENANT_ID,
          trekId: data.trek_id || null,
          content: chunk,
          embedding,
          metadata: data.metadata || {},
        });
      } catch (err) {
        // Non-blocking error handling for individual chunk failures during ingestion
        console.error("[KnowledgeService] Embedding error:", err);
      }
    }

    return; // Returns void as per interface
  }

  /**
   * Searches the knowledge base for content semantically related to the query.
   *
   * @param data - The DTO containing the specific search query terms.
   * @param limit - Max number of relevant chunks to retrieve (defaults to 3).
   * @returns A Promise resolving to an array of matching text chunks.
   */
  public async search(
    data: KnowledgeSearchQuery,
    limit: number = 3,
  ): Promise<string[]> {
    try {
      // Create embedding for the search query to enable vector similarity comparison
      const embedResult = await embeddingModel.embedContent(data.q);
      const embedding = embedResult.embedding.values;

      /**
       * Delegate the vector similarity search to the repository.
       * Uses Cosine Similarity or Inner Product depending on the database configuration.
       */
      return await this.knowledgeRepository.semanticSearch({
        tenantId: MVP_TENANT_ID,
        embedding,
        limit,
      });
    } catch (err) {
      console.error("[KnowledgeService] Search error:", err);
      return [];
    }
  }

  /**
   * Splits text into fixed-size segments.
   *
   * @param text - The full input string.
   * @param size - The maximum character count for each chunk.
   * @returns An array of string segments.
   */
  private simpleChunk(text: string, size: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.substring(start, start + size));
      start += size;
    }
    return chunks;
  }
}
