import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catalogService } from './catalog.service.js';
import { getJerseysQuerySchema, getJerseyBySlugSchema } from './catalog.schemas.js';

/**
 * GET /api/clubs
 * Retrieves list of all clubs with jersey counts
 */
export const getClubs = asyncHandler(async (_req: Request, res: Response) => {
  const clubs = await catalogService.getClubs();

  res.status(200).json(
    new ApiResponse(200, clubs, 'Football clubs retrieved successfully')
  );
});

/**
 * GET /api/jerseys
 * Retrieves paginated catalog jerseys with faceted filtering
 */
export const getJerseys = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getJerseysQuerySchema.parse(req.query);
  const result = await catalogService.getJerseys(validatedQuery);

  res.status(200).json(
    new ApiResponse(200, result, 'Jerseys retrieved successfully')
  );
});

/**
 * GET /api/jerseys/:slug
 * Retrieves complete jersey details, club metadata, and size variants
 */
export const getJerseyBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = getJerseyBySlugSchema.parse(req.params);
  const jersey = await catalogService.getJerseyBySlug(slug);

  if (!jersey) {
    throw new ApiError(404, `Jersey not found with slug: '${slug}'`);
  }

  res.status(200).json(
    new ApiResponse(200, jersey, 'Jersey details retrieved successfully')
  );
});
