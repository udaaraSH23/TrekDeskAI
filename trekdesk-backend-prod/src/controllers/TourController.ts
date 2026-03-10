import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { ITourService } from "../interfaces/services/ITourService";
import { TrekSchema } from "../models/trek.schema";

/**
 * Controller handling HTTP requests related to the Tour/Trek catalog.
 * Manages fetching lists, fetching details, and creating new offerings.
 */
export class TourController {
  constructor(private tourService: ITourService) {}

  /**
   * GET /api/treks
   * Retrieves all active treks for the current tenant.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getTreks(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const treks = await this.tourService.getActiveTreks(MVP_TENANT_ID);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Treks retrieved successfully",
        treks,
        { results: treks.length },
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/treks/:trekId
   * Retrieves the comprehensive detail view of a specific trek.
   * Throws a 404 NotFoundError if the trek does not exist or belongs to another tenant.
   *
   * @param req - Express request object containing `trekId` in params.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getTrekDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { trekId } = req.params;

    try {
      const trek = await this.tourService.getTrekDetail(
        trekId as string,
        MVP_TENANT_ID,
      );

      if (!trek) {
        throw new NotFoundError("Trek not found");
      }

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Trek detail retrieved successfully",
        trek,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/treks
   * Validates and persists a newly created trek offering.
   *
   * @param req - Express request object housing the partial Trek payload in the body.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async createTrek(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate incoming request body dynamically and safely
      const validTrekData = TrekSchema.parse(req.body);

      const newTrek = await this.tourService.createTrek({
        tenantId: MVP_TENANT_ID,
        ...validTrekData,
      });

      ApiResponse.sendSuccess(
        res,
        HttpStatus.CREATED,
        "Trek created successfully",
        newTrek,
      );
    } catch (err) {
      next(err);
    }
  }
}
