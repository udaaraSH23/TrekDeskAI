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
 * /api/v1/tours/:tenantId:
 *   get:
 *     summary: Get all active treks for a tenant
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of treks
 */
router.get("/:tenantId", tourController.getTreks.bind(tourController));

/**
 * @swagger
 * /api/v1/tours:
 *   get:
 *     summary: Get all active treks for MVP tenant
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of treks
 */
router.get("/", tourController.getTreks.bind(tourController));

/**
 * @swagger
 * /api/v1/tours/{trekId}:
 *   get:
 *     summary: Get details of a specific trek
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: trekId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trek details
 *       404:
 *         description: Trek not found
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
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Trek created successfully
 */
router.post(
  "/",
  validate(createTrekSchema),
  tourController.createTrek.bind(tourController),
);

export default router;
