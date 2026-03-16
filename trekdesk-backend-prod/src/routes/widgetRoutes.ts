import { Router } from "express";
import { widgetController } from "../config/di";
import { validate } from "../middleware/validate";
import { updateWidgetSchema } from "../validators/widgetValidators";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WidgetSettings:
 *       type: object
 *       properties:
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           example: "00000000-0000-0000-0000-000000000001"
 *         primary_color:
 *           type: string
 *           example: "#10b981"
 *         position:
 *           type: string
 *           enum: [left, right]
 *           example: "right"
 *         initial_message:
 *           type: string
 *           example: "Hi! How can I help you today?"
 *         allowed_origins:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com"]
 *         updated_at:
 *           type: string
 *           format: date-time
 *     UpdateWidgetPayload:
 *       type: object
 *       properties:
 *         primary_color:
 *           type: string
 *           example: "#10b981"
 *         position:
 *           type: string
 *           enum: [left, right]
 *           example: "right"
 *         initial_message:
 *           type: string
 *           example: "Hi! How can I help you today?"
 *         allowed_origins:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com"]
 */

/**
 * @swagger
 * /api/v1/widget/embed/chat:
 *   get:
 *     summary: Render widget embed wrapper
 *     description: |
 *       Serves an HTML wrapper for the widget chat.
 *       Includes Content-Security-Policy headers for iframe protection.
 *     tags: [Widget]
 *     parameters:
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: HTML wrapper rendered successfully
 */
router.get("/embed/chat", widgetController.renderEmbed.bind(widgetController));

/**
 * @swagger
 * /api/v1/widget/settings:
 *   get:
 *     summary: Get widget settings for the tenant
 *     description: |
 *       Retrieves the administrative configuration for the AI Chat Widget.
 *       Includes visual branding (colors, position) and security rules (authorized domains).
 *     tags: [Widget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/WidgetSettings'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       404:
 *         description: Not Found - Widget settings have not been initialized for this tenant
 *       500:
 *         description: Internal Server Error
 */
router.get("/settings", widgetController.getSettings.bind(widgetController));

/**
 * @swagger
 * /api/v1/widget/settings:
 *   put:
 *     summary: Update widget settings
 *     description: |
 *       Updates or initializes the widget configuration.
 *       Fields are optional; only provided fields will be updated (CORS origins are replaced).
 *     tags: [Widget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWidgetPayload'
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/WidgetSettings'
 *       400:
 *         description: Bad Request - Validation failed (e.g., invalid HEX color or malformed UUID)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put(
  "/settings",
  validate(updateWidgetSchema),
  widgetController.updateSettings.bind(widgetController),
);

export default router;
