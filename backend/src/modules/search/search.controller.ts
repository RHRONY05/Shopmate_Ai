import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { EmbeddingService } from '../../services/embeddingService.js';
import { semanticSearchQuerySchema } from './search.schemas.js';

/**
 * GET /api/search/semantic
 * Performs natural language semantic search using pgvector cosine distance
 */
export const semanticSearch = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = semanticSearchQuerySchema.parse(req.query);

  const results = await EmbeddingService.findSimilarJerseys(validatedQuery.q, {
    limit: validatedQuery.limit,
    league: validatedQuery.league,
    kitType: validatedQuery.kitType,
    maxPrice: validatedQuery.maxPrice,
    minSimilarity: validatedQuery.minSimilarity,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        query: validatedQuery.q,
        count: results.length,
        results,
      },
      'Semantic kit search completed successfully'
    )
  );
});
