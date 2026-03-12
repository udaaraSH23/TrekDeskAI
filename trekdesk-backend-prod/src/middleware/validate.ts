import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { BadRequestError } from "../utils/errors/CustomErrors";

/**
 * Higher-Order Middleware factory for robust request payload validation using Zod.
 *
 * Internally utilizes `schema.parseAsync` to rigorously check the `req.body`, `req.query`,
 * and `req.params` against a predefined Zod definition (usually imported from `src/validators`).
 *
 * If validation fails, it intercepts the request and safely triggers the global error handler
 * with a standardized 400 Bad Request payload detailing exactly which fields were invalid,
 * preventing malformed data from ever reaching the controller tier.
 *
 * @param schema - The Zod schema wrapping `body`, `query`, or `params`.
 * @returns An Express middleware async function.
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the Zod issues into a readable string
        const errorMessages = (error as any).errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));

        // Pass to the global errorHandler as a 400 Bad Request
        const badRequest = new BadRequestError("Invalid request data");
        // We can attach the details to the error message (or enhance AppError later to hold data)
        badRequest.message = `Validation Failed: ${JSON.stringify(errorMessages)}`;
        return next(badRequest);
      }
      return next(error);
    }
  };
