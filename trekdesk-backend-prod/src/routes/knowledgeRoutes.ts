/**
 * @file knowledgeRoutes.ts
 * @description Express routes for knowledge ingestion and semantic search.
 */
import { Router } from "express";
import { knowledgeController } from "../config/di";
import { validate } from "../middleware/validate";
import {
  ingestKnowledgeSchema,
  searchKnowledgeSchema,
} from "../validators/knowledgeValidators";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/v1/knowledge/ingest:
 *   post:
 *     summary: Ingest a new document into the RAG vector database
 *     description: Computes semantic embeddings for the provided text using Gemini and stores it in PostgreSQL via pgvector for later retrieval.
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Kandy Treks cancellation policy: Full refund if canceled 48 hours in advance."
 *               trek_id:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               metadata:
 *                 type: object
 *                 example: {"source": "admin_dashboard", "category": "policy"}
 *     responses:
 *       200:
 *         description: Document successfully ingested and vectorized
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Knowledge chunk ingested successfully"
 *               data:
 *                 id: "999e4567-e89b-12d3-a456"
 *                 content_snippet: "Kandy Treks cancellation policy..."
 *       400:
 *         description: Bad Request (Missing content or invalid formatting)
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/ingest",
  validate(ingestKnowledgeSchema),
  authMiddleware,
  knowledgeController.ingest.bind(knowledgeController),
);

/**
 * @swagger
 * /api/v1/knowledge/search:
 *   get:
 *     summary: Perform a semantic vector search
 *     description: Searches the knowledge base using cosine similarity against the provided natural language query. Used internally by the AI Tool caller.
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         example: "What happens if it rains during the tour?"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         example: 3
 *     responses:
 *       200:
 *         description: Search results from vector database ordered by similarity.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Knowledge base searched successfully"
 *               data:
 *                 - id: "999e4567-e89b-12d3"
 *                   content: "In case of heavy rain, tours are rescheduled or fully refunded."
 *                   similarity: 0.892
 *                   trek_id: null
 *               meta:
 *                 results: 1
 *       400:
 *         description: Bad Request (Missing search query)
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/search",
  validate(searchKnowledgeSchema),
  authMiddleware,
  knowledgeController.search.bind(knowledgeController),
);

export default router;
