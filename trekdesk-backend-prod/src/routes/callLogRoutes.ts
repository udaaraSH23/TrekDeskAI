/**
 * @file callLogRoutes.ts
 * @description Express routes for accessing call logs and interaction analytics.
 */
import { Router } from "express";
import { callLogController } from "../config/di";
import { validate } from "../middleware/validate";
import { getLogDetailSchema } from "../validators/callLogValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/calls/stats:
 *   get:
 *     summary: Get dashboard statistics for calls
 *     description: Condenses historical interactions into actionable dashboard widgets, highlighting hot leads and trends.
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call log statistics successfully calculated.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Call log stats retrieved successfully"
 *               data:
 *                 totalCalls: 124
 *                 hotLeads:
 *                   - id: "123e4567-e89b-12d3"
 *                     sentiment_score: 0.85
 *                     summary: "Extremely interested in the 3-day hike."
 *                 leadsCount: 5
 *                 conversionRate: "N/A"
 *                 revenue: "N/A"
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", callLogController.getStats.bind(callLogController));

/**
 * @swagger
 * /api/v1/analytics/calls:
 *   get:
 *     summary: Get a list of call logs (Transcripts)
 *     description: Retrieves an ordered list of all historical AI phone call transcriptions.
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of call logs retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Call logs retrieved successfully"
 *               data:
 *                 - id: "123e4567-e89b-12d3"
 *                   session_id: "sess_x8f9j"
 *                   duration_seconds: 145
 *                   sentiment_score: 0.6
 *                   summary: "Customer asked about pricing."
 *               meta:
 *                 results: 1
 *       401:
 *         description: Unauthorized
 */
router.get("/", callLogController.getLogs.bind(callLogController));

/**
 * @swagger
 * /api/v1/analytics/calls/{logId}:
 *   get:
 *     summary: Get detailed trace for a specific call
 *     description: Returns the raw transcription text and calculated KPIs for a precise conversation.
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Call log details retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Call log detail retrieved successfully"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456"
 *                 transcript: { "full_text": "Hello, I want to book..." }
 *                 duration_seconds: 145
 *                 sentiment_score: 0.6
 *       404:
 *         description: Not Found (Log doesn't exist or belongs to another tenant)
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Call log not found"
 */
router.get(
  "/:logId",
  validate(getLogDetailSchema),
  callLogController.getLogDetail.bind(callLogController),
);

export default router;
