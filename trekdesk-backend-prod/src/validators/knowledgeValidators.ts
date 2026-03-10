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
