import { Request, Response, NextFunction } from "express";
import { IKnowledgeService } from "../interfaces/services/IKnowledgeService";
import { BadRequestError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";

import {
  KnowledgeDocument,
  KnowledgeSearchQuery,
} from "../models/knowledge.schema";

/**
 * Controller handling HTTP requests for the Vector Knowledge Base.
 * Enables uploading proprietary documents and executing context-aware semantic searches.
 */
export class KnowledgeController {
  constructor(private knowledgeService: IKnowledgeService) {}

  /**
   * POST /api/knowledge/ingest
   * Translates text payloads into vector embeddings and stores them.
   *
   * @param req - Express request object containing the `KnowledgeDocument` payload.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async ingest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const bodyObj: KnowledgeDocument = req.body;

    if (!bodyObj.content) {
      return next(new BadRequestError("Content is required for ingestion"));
    }

    try {
      const result = await this.knowledgeService.ingestDocument(bodyObj);
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Document ingested successfully",
        result,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/knowledge/search
   * Uses cosine distance in pgvector to retrieve the most semantically relevant text chunks.
   *
   * @param req - Express request object holding the `q` query string parameter.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async search(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const queryObj: KnowledgeSearchQuery = {
      q: req.query.q as string,
    };

    if (!queryObj.q) {
      return next(new BadRequestError('Query parameter "q" is required'));
    }

    try {
      const results = await this.knowledgeService.search(queryObj);
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Search completed successfully",
        results,
      );
    } catch (err) {
      next(err);
    }
  }
}
