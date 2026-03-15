/**
 * @file KnowledgeController.ts
 * @description Controller handling HTTP requests for the Vector Knowledge Base.
 * Enables uploading proprietary documents and executing context-aware semantic searches.
 *
 * @module KnowledgeBase
 * @category Controllers
 */

import { Request, Response, NextFunction } from "express";
import { IKnowledgeService } from "../interfaces/services/IKnowledgeService";
import { BadRequestError } from "../utils/errors/CustomErrors";
import { ApiResponse } from "../utils/response/ApiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { MVP_TENANT_ID } from "../config/constants";

import { KnowledgeIngestDTO, KnowledgeSearchDTO } from "../dtos/KnowledgeDTO";

/**
 * KnowledgeController
 *
 * Orchestrates the RESTful API for the Retrieval-Augmented Generation (RAG) system.
 * Acts as the entry point for ingesting raw text and performing vector similarity searches.
 */
export class KnowledgeController {
  constructor(private knowledgeService: IKnowledgeService) {}

  /**
   * Translates text payloads into vector embeddings and stores them.
   *
   * @param req - Express request object containing the `KnowledgeIngestDTO` payload.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   * @returns A Promise resolving when ingestion is initiated.
   */
  public async ingest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const bodyObj: KnowledgeIngestDTO = req.body;

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
   * Uses cosine distance in pgvector to retrieve the most semantically relevant text chunks.
   *
   * @param req - Express request object holding the `q` query string parameter.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   * @returns A Promise resolving to search results.
   */
  public async search(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const queryObj: KnowledgeSearchDTO = {
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

  /**
   * Updates an existing knowledge chunk.
   * Triggers a recalculation of embeddings on the service layer.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async updateKnowledge(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { chunkId } = req.params;
    const { content } = req.body;

    if (!content) {
      return next(new BadRequestError("New content is required for update"));
    }

    try {
      await this.knowledgeService.updateKnowledge({
        chunkId: chunkId as string,
        tenantId: MVP_TENANT_ID,
        content,
      });
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Knowledge chunk updated successfully",
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Removes a knowledge chunk from the vector store.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async deleteKnowledge(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { chunkId } = req.params;

    try {
      await this.knowledgeService.deleteKnowledge({
        chunkId: chunkId as string,
        tenantId: MVP_TENANT_ID,
      });
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Knowledge chunk deleted successfully",
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all knowledge chunks for the current tenant.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const results = await this.knowledgeService.getAllChunks(MVP_TENANT_ID);
      ApiResponse.sendSuccess(
        res,
        HttpStatus.OK,
        "Knowledge chunks retrieved successfully",
        results,
      );
    } catch (err) {
      next(err);
    }
  }
}
