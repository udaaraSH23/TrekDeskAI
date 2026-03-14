import { Router } from "express";
import { chatController } from "../config/di";
import { validate } from "../middleware/validate";
import { chatMessageSchema } from "../validators/chatValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/chat/message:
 *   post:
 *     summary: Send a message to the AI assistant
 *     description: |
 *       Public endpoint used by the TrekDesk widget to interact with a tenant's AI assistant.
 *       Includes origin validation to ensure the request is coming from an authorized domain.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application_json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - message
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *                 description: The unique identifier of the tenant.
 *               message:
 *                 type: string
 *                 description: The user's input message.
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       description: The AI's reply text.
 *                     trace:
 *                       type: array
 *                       items:
 *                         type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request data (validation failed)
 *       403:
 *         description: Unauthorized origin
 *       404:
 *         description: Tenant or widget not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/message",
  validate(chatMessageSchema),
  chatController.handleMessage.bind(chatController),
);

export default router;
