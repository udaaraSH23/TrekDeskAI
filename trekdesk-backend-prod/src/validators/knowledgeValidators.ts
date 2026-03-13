/**
 * @file knowledgeValidators.ts
 * @description Zod validation schemas for Knowledge Base operations.
 * These schemas handle the validation for ingesting new factual content and searching the knowledge base.
 */

import { z } from "zod";
import {
  KnowledgeDocumentSchema,
  KnowledgeSearchQuerySchema,
} from "../models/knowledge.schema";

/**
 * Validation schema for ingesting new content into the AI's knowledge base.
 * Ensures the content meets length requirements and permits optional trek association and metadata.
 */
export const ingestKnowledgeSchema = z.object({
  body: KnowledgeDocumentSchema,
});

/**
 * Validation schema for searching the knowledge base.
 * Validates the search query parameter 'q'.
 */
export const searchKnowledgeSchema = z.object({
  query: KnowledgeSearchQuerySchema,
});

/**
 * Validation schema for updating existing knowledge content.
 */
export const updateKnowledgeSchema = z.object({
  params: z.object({
    chunkId: z.string().uuid("Invalid Chunk ID format"),
  }),
  body: z.object({
    content: z.string().min(10).max(50000),
  }),
});

/**
 * Validation schema for deleting knowledge chunks.
 */
export const deleteKnowledgeSchema = z.object({
  params: z.object({
    chunkId: z.string().uuid("Invalid Chunk ID format"),
  }),
});
