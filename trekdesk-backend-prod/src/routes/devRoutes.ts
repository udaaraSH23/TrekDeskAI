import { Router } from "express";
import { devController } from "../config/di";
import { validate } from "../middleware/validate";
import { testPromptSchema } from "../validators/devValidators";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dev
 *   description: Developer diagnostic and testing utilities
 */

/**
 * @swagger
 * /api/v1/dev/test-prompt:
 *   post:
 *     summary: Supervised AI invocation with tracing
 *     description: |
 *       Executes a single turn with the Gemini AI model and returns a systematic trace of all tool calls made.
 *       Includes internal logs captured during execution.
 *     tags: [Dev]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "What is the weather in Kandy today?"
 *     responses:
 *       200:
 *         description: Diagnostic turn completed successfully
 */
router.post(
  "/test-prompt",
  validate(testPromptSchema),
  devController.testPrompt.bind(devController),
);

/**
 * @swagger
 * /api/v1/dev/tools:
 *   get:
 *     summary: List registered AI tools
 *     tags: [Dev]
 *     responses:
 *       200:
 *         description: Tool registry retrieved
 */
router.get("/tools", devController.getTools.bind(devController));

/**
 * @swagger
 * /api/v1/dev/calendar:
 *   get:
 *     summary: Diagnostic Google Calendar lookup
 *     tags: [Dev]
 *     responses:
 *       200:
 *         description: Calendar events retrieved
 */
router.get("/calendar", devController.getCalendar.bind(devController));

export default router;
