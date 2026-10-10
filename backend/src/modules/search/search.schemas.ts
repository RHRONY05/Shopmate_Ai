import { z } from 'zod';
import { KitType } from '@prisma/client';

export const semanticSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query cannot be empty'),
  limit: z.coerce.number().int().min(1).max(20).default(5),
  league: z.string().trim().optional(),
  kitType: z.nativeEnum(KitType).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minSimilarity: z.coerce.number().min(0).max(1).default(0.3),
});

export type SemanticSearchQuery = z.infer<typeof semanticSearchQuerySchema>;
