/**
 * @file TourController.ts
 * @description Controller for managing tour and trek catalog HTTP requests.
 */
import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { ITourService } from "../interfaces/services/ITourService";

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
      // The payload has already been strictly validated by the 'validate' middleware in tourRoutes.ts
      const newTrek = await this.tourService.createTrek({
        tenantId: MVP_TENANT_ID,
        ...req.body,
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

  /**
   * PATCH /api/treks/:trekId
   * Updates an existing trek's metadata or pricing.
   */
  public async updateTrek(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { trekId } = req.params;

    try {
      const updatedTrek = await this.tourService.updateTrek({
        tenantId: MVP_TENANT_ID,
        trekId: trekId as string,
        ...req.body,
      });

      if (!updatedTrek) {
        throw new NotFoundError("Trek not found");
      }

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Trek updated successfully",
        updatedTrek,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/treks/:trekId
   * Removes a trek from the catalog.
   */
  public async deleteTrek(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { trekId } = req.params;

    try {
      await this.tourService.deleteTrek({
        trekId: trekId as string,
        tenantId: MVP_TENANT_ID,
      });

      ApiResponse.sendSuccess(res, HttpStatus.OK, "Trek deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}
