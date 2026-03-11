/**
 * @file tourRoutes.ts
 * @description Express routes for tour and trek management.
 */
import { Router } from "express";
import { tourController } from "../config/di";
import { validate } from "../middleware/validate";
import {
  createTrekSchema,
  getTrekDetailSchema,
} from "../validators/tourValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/tours/{tenantId}:
 *   get:
 *     summary: Get all active treks for a specific tenant
 *     description: Returns a public list of all available tours for the requested operator.
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         example: "00000000-0000-0000-0000-000000000001"
 *     responses:
 *       200:
 *         description: List of treks for the tenant.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Treks retrieved successfully"
 *               data:
 *                 - id: "223e4567-e89b-12d3"
 *                   name: "Everest Base Camp"
 *                   base_price_per_person: "1200.00"
 *                   difficulty_level: "Hard"
 *               meta:
 *                 results: 1
 */
router.get("/:tenantId", tourController.getTreks.bind(tourController));

/**
 * @swagger
 * /api/v1/tours:
 *   get:
 *     summary: Get all active treks (MVP Default)
 *     description: Defaults to returning all tours for Kandy Treks (the MVP default tenant).
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of default treks.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Treks retrieved successfully"
 *               data:
 *                 - id: "223e4567-e89b-12d3"
 *                   name: "Adam's Peak Sunrise"
 *                   base_price_per_person: "45.00"
 *                   difficulty_level: "Medium"
 *               meta:
 *                 results: 1
 */
router.get("/", tourController.getTreks.bind(tourController));

/**
 * @swagger
 * /api/v1/tours/{trekId}:
 *   get:
 *     summary: Get detailed view of one trek
 *     description: Returns the complete details, full description, and transport fees for an individual tour.
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: trekId
 *         required: true
 *         schema:
 *           type: string
 *         example: "223e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Trek details retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Trek detail retrieved successfully"
 *               data:
 *                 id: "223e4567-e89b-12d3-a456"
 *                 name: "Sigiriya Rock Fortress"
 *                 description: "A full day tour exploring the ancient rock fortress..."
 *                 base_price_per_person: "60.00"
 *                 transport_fee: "20.00"
 *                 difficulty_level: "Easy"
 *       404:
 *         description: Trek not found
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Trek not found"
 */
router.get(
  "/:trekId",
  validate(getTrekDetailSchema),
  tourController.getTrekDetail.bind(tourController),
);

/**
 * @swagger
 * /api/v1/tours:
 *   post:
 *     summary: Create a new trek
 *     description: Adds a new tour package to the current operator's catalog.
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - base_price_per_person
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Yala National Park Safari"
 *               description:
 *                 type: string
 *                 example: "Half-day jeep safari to see leopards and elephants."
 *               base_price_per_person:
 *                 type: number
 *                 example: 85.00
 *               transport_fee:
 *                 type: number
 *                 example: 0
 *               difficulty_level:
 *                 type: string
 *                 example: "Easy"
 *     responses:
 *       201:
 *         description: Trek created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Trek created successfully"
 *               data:
 *                 id: "334e4567-e89b"
 *                 name: "Yala National Park Safari"
 */
router.post(
  "/",
  validate(createTrekSchema),
  tourController.createTrek.bind(tourController),
);

export default router;
