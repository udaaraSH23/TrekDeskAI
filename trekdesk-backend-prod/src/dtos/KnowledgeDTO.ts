/**
 * @file KnowledgeDTO.ts
 * @description Data Transfer Objects for the Knowledge Base module.
 */

import {
  KnowledgeDocument,
  KnowledgeSearchQuery,
  KnowledgeSearchResult,
  InsertDocumentChunkPayload,
  SemanticSearchPayload,
  UpdateKnowledgeChunkPayload,
  UpdateKnowledgeServicePayload,
  DeleteKnowledgePayload,
} from "../models/knowledge.schema";

/**
 * DTO for document ingestion.
 */
export type KnowledgeIngestDTO = KnowledgeDocument;

/**
 * DTO for semantic search query.
 */
export type KnowledgeSearchDTO = KnowledgeSearchQuery;

/**
 * Result structure for semantic search.
 */
export type KnowledgeSearchResultDTO = KnowledgeSearchResult;

/**
 * DTO for internal repository chunk insertion.
 */
export type InsertDocumentChunkDTO = InsertDocumentChunkPayload;

/**
 * DTO for semantic search repository payload.
 */
export type SemanticSearchDTO = SemanticSearchPayload;

/**
 * DTO for updating an existing knowledge chunk in the repository.
 */
export type UpdateKnowledgeChunkDTO = UpdateKnowledgeChunkPayload;

/**
 * DTO for the Knowledge Service update operation.
 */
export type UpdateKnowledgeDTO = UpdateKnowledgeServicePayload;

/**
 * DTO for deleting knowledge chunks.
 */
export type DeleteKnowledgeDTO = DeleteKnowledgePayload;
