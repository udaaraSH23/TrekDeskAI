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
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call log statistics
 */
router.get("/stats", callLogController.getStats.bind(callLogController));

/**
 * @swagger
 * /api/v1/analytics/calls:
 *   get:
 *     summary: Get a paginated list of call logs
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of call logs
 */
router.get("/", callLogController.getLogs.bind(callLogController));

/**
 * @swagger
 * /api/v1/analytics/calls/detail/{logId}:
 *   get:
 *     summary: Get detailed information for a specific call log
 *     tags: [Call Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Call log details
 *       404:
 *         description: Log not found
 */
router.get(
  "/:logId",
  validate(getLogDetailSchema),
  callLogController.getLogDetail.bind(callLogController),
);

export default router;
