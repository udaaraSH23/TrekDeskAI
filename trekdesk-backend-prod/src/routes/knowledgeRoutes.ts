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
 *               trek_id:
 *                 type: string
 *                 nullable: true
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Document successfully ingested and vectorized
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
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Search results from vector database
 */
router.get(
  "/search",
  validate(searchKnowledgeSchema),
  authMiddleware,
  knowledgeController.search.bind(knowledgeController),
);

export default router;
