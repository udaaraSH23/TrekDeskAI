/**
 * @file personaRoutes.ts
 * @description Express routes for managing AI persona settings and system prompt instructions.
 */
import { Router } from "express";
import { personaController } from "../config/di";
import { validate } from "../middleware/validate";
import { updatePersonaSchema } from "../validators/personaValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/persona/settings:
 *   get:
 *     summary: Get AI persona settings for the tenant
 *     description: Retrieves the current system prompt and voice model configuration instructing the AI agent.
 *     tags: [AI Persona]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns persona settings like voice and prompt instructions.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Persona settings retrieved successfully"
 *               data:
 *                 tenant_id: "00000000-0000-0000-0000-000000000001"
 *                 voice_name: "Aoede"
 *                 system_instruction: "You are a helpful trekking guide for guidetours."
 *                 temperature: 0.7
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 */
router.get("/settings", personaController.getSettings.bind(personaController));

/**
 * @swagger
 * /api/v1/persona/settings:
 *   put:
 *     summary: Update AI persona settings
 *     description: Modifies the system instructions or voice identity of the tenant's AI representative.
 *     tags: [AI Persona]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voice_name:
 *                 type: string
 *                 example: "Puck"
 *               system_instruction:
 *                 type: string
 *                 example: "You are a highly energetic tour guide. Always greet users with enthusiasm."
 *     responses:
 *       200:
 *         description: Persona settings updated successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Persona settings updated successfully"
 *               data:
 *                 tenant_id: "00000000-0000-0000-0000-000000000001"
 *                 voice_name: "Puck"
 *                 system_instruction: "You are a highly energetic tour guide. Always greet users with enthusiasm."
 *                 temperature: 0.7
 *       400:
 *         description: Bad Request (Invalid input parameters)
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 */
router.put(
  "/settings",
  validate(updatePersonaSchema),
  personaController.updateSettings.bind(personaController),
);

export default router;
