import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";
import { ICallLogService } from "../interfaces/services/ICallLogService";

/**
 * Controller handling HTTP requests for the session Call Logs.
 * Supplies transcript reading and aggregated KPI capabilities to the frontend dashboard.
 */
export class CallLogController {
  constructor(private callLogService: ICallLogService) {}

  /**
   * GET /api/logs
   * Retrieves paginated/ordered transcripts of all AI-user historical conversations.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const logs = await this.callLogService.getLogsByTenant(MVP_TENANT_ID);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Call logs retrieved successfully",
        logs,
        { results: logs.length },
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/logs/:logId
   * Looks up a singular precise call log trace (including raw transcript and summary).
   *
   * @param req - Express request object where `logId` resides in URL params.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getLogDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { logId } = req.params;

    try {
      const log = await this.callLogService.getLogByIdAndTenant(
        logId as string,
        MVP_TENANT_ID,
      );

      if (!log) {
        throw new NotFoundError("Call log not found");
      }

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Call log detail retrieved successfully",
        log,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/logs/stats
   * Condenses historical interactions into actionable dashboard widgets (e.g. sentiment hot-leads).
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await this.callLogService.getStatsByTenant(MVP_TENANT_ID);

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Call log stats retrieved successfully",
        {
          total_calls: stats.totalCalls,
          hot_leads: stats.hotLeads,
          leads_count: stats.leadsCount,
          conversion_rate: "N/A",
          revenue: "N/A",
        },
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/logs/:logId
   * Permanently removes a specific call record.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async deleteLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { logId } = req.params;

    try {
      await this.callLogService.deleteLog({
        logId: logId as string,
        tenantId: MVP_TENANT_ID,
      });

      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Call log deleted successfully",
      );
    } catch (err) {
      next(err);
    }
  }
}
