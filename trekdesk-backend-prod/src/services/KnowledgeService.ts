/**
 * @file KnowledgeService.ts
 * @description RAG (Retrieval-Augmented Generation) service for handling domain-specific knowledge.
 * Manages document ingestion, vector embeddings, and semantic search capabilities.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { IKnowledgeRepository } from "../interfaces/repositories/IKnowledgeRepository";
import { IKnowledgeService } from "../interfaces/services/IKnowledgeService";
import { MVP_TENANT_ID } from "../config/constants";
import { logger } from "../utils/logger";

/**
 * Initializes the Google Generative AI client with the provided API key.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Specifically uses the gemini-embedding-001 model for creating vector representations of text.
 */
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

import {
  DeleteKnowledgePayload,
  KnowledgeDocument,
  KnowledgeSearchQuery,
  UpdateKnowledgeServicePayload,
  KnowledgeSearchResult,
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
   * @note Uses Recursive Character Splitting and Batch Embeddings for production readiness.
   */
  public async ingestDocument(data: KnowledgeDocument) {
    // Production-ready defaults: 1000 chars with 200 char overlap
    const chunks = this.recursiveCharacterSplit(data.content, 1000, 200);

    logger.info(
      `[KnowledgeService] Ingesting ${chunks.length} chunks via batch embedding...`,
    );

    try {
      // Prepare batch embedding request
      const batchRequests = chunks.map((chunk) => ({
        content: { role: "user", parts: [{ text: chunk }] },
        outputDimensionality: 768,
      }));

      // Generate vector embeddings in a single batch call
      const batchResult = await embeddingModel.batchEmbedContents({
        requests: batchRequests,
      } as never);

      const embeddings = batchResult.embeddings;

      // Persist chunks and their embeddings to the vector database
      // We perform individual inserts for the MVP to keep the repository logic simple and reliable
      for (let i = 0; i < chunks.length; i++) {
        await this.knowledgeRepository.insertDocumentChunk({
          tenantId: MVP_TENANT_ID,
          trekId: data.trek_id || null,
          content: chunks[i],
          embedding: embeddings[i].values,
          metadata: {
            ...data.metadata,
            chunk_index: i,
            total_chunks: chunks.length,
          },
        });
      }

      logger.info(
        `[KnowledgeService] Successfully ingested ${chunks.length} chunks for trek: ${data.trek_id || "global"}`,
      );
    } catch (error) {
      const err = error as Error;
      logger.error("[KnowledgeService] Batch ingestion error:", err);
      throw new Error(`Failed to process knowledge document: ${err.message}`, {
        cause: error,
      });
    }
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
  ): Promise<KnowledgeSearchResult[]> {
    try {
      // Create embedding for the search query to enable vector similarity comparison
      const embedResult = await embeddingModel.embedContent({
        content: { role: "user", parts: [{ text: data.q }] },
        outputDimensionality: 768,
      } as never);
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
      logger.error("[KnowledgeService] Search error:", err);
      return [];
    }
  }

  /**
   * Updates an existing knowledge chunk and its vector representation.
   */
  public async updateKnowledge(
    data: UpdateKnowledgeServicePayload,
  ): Promise<void> {
    const { chunkId, tenantId, content } = data;
    logger.info(`[KnowledgeService] Updating knowledge chunk: ${chunkId}`);

    try {
      // Re-generate vector embedding for the updated content
      const result = await embeddingModel.embedContent({
        content: { role: "user", parts: [{ text: content }] },
        outputDimensionality: 768,
      } as never);
      const embedding = result.embedding.values;

      await this.knowledgeRepository.updateKnowledgeChunk({
        tenantId,
        chunkId,
        content,
        embedding,
      });
    } catch (err) {
      logger.error("[KnowledgeService] Update/Embedding error:", err);
      throw err;
    }
  }

  /**
   * Removes a knowledge chunk from the base.
   */
  public async deleteKnowledge(data: DeleteKnowledgePayload): Promise<void> {
    const { chunkId, tenantId } = data;
    logger.info(`[KnowledgeService] Deleting knowledge chunk: ${chunkId}`);
    await this.knowledgeRepository.deleteKnowledgeChunk({ chunkId, tenantId });
  }

  /**
   * Retrieves all knowledge chunks for a specific tenant.
   */
  public async getAllChunks(
    tenantId: string,
  ): Promise<KnowledgeSearchResult[]> {
    return await this.knowledgeRepository.listAllChunks(tenantId);
  }

  /**
   * Recursive Character Text Splitter.
   * Splits text into segments while trying to preserve semantic boundaries (paragraphs, sentences).
   * Includes overlap to ensure context continuity.
   *
   * @param text - The full input string.
   * @param maxSize - The maximum character count for each chunk.
   * @param overlap - The number of characters to overlap between chunks.
   * @returns An array of string segments.
   */
  private recursiveCharacterSplit(
    text: string,
    maxSize: number,
    overlap: number,
  ): string[] {
    const separators = ["\n\n", "\n", ". ", "? ", "! ", " ", ""];

    const splitRecursively = (content: string, depth: number): string[] => {
      if (content.length <= maxSize) return [content];
      if (depth >= separators.length) return [content]; // Fallback to hard cut if no separators left

      const separator = separators[depth];
      const parts = content.split(separator);
      const result: string[] = [];
      let currentPart = "";

      for (const part of parts) {
        const potentialChunk =
          currentPart + (currentPart ? separator : "") + part;
        if (potentialChunk.length <= maxSize) {
          currentPart = potentialChunk;
        } else {
          if (currentPart) {
            result.push(currentPart);
          }
          // If a single part is still too big, recurse deeper
          if (part.length > maxSize) {
            result.push(...splitRecursively(part, depth + 1));
            currentPart = "";
          } else {
            currentPart = part;
          }
        }
      }
      if (currentPart) result.push(currentPart);
      return result;
    };

    const rawChunks = splitRecursively(text, 0);

    // Apply overlap logic
    if (overlap <= 0 || rawChunks.length <= 1) return rawChunks;

    const overlappedChunks: string[] = [];
    for (let i = 0; i < rawChunks.length; i++) {
      let chunk = rawChunks[i];
      if (i > 0) {
        const prevChunk = rawChunks[i - 1];
        const overlapText = prevChunk.slice(-overlap);
        chunk = overlapText + chunk;
      }
      overlappedChunks.push(chunk);
    }

    return overlappedChunks;
  }
}
