import { z } from 'zod';
import { KitType, Era, Size } from '@prisma/client';

export const getJerseysQuerySchema = z
  .object({
    clubId: z.string().uuid().optional(),
    clubSlug: z.string().trim().optional(),
    league: z.string().trim().optional(),
    kitType: z.nativeEnum(KitType).optional(),
    era: z.nativeEnum(Era).optional(),
    size: z.nativeEnum(Size).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isFeatured: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z
      .enum(['price', 'title', 'createdAt', 'rating', 'newest', 'price_asc', 'price_desc'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .transform((data) => {
    let sortBy = data.sortBy;
    let sortOrder = data.sortOrder;

    if (sortBy === 'newest') {
      sortBy = 'createdAt';
      sortOrder = sortOrder || 'desc';
    } else if (sortBy === 'price_asc') {
      sortBy = 'price';
      sortOrder = 'asc';
    } else if (sortBy === 'price_desc') {
      sortBy = 'price';
      sortOrder = 'desc';
    } else if (sortBy === 'rating') {
      sortOrder = sortOrder || 'desc';
    }

    return {
      ...data,
      sortBy: sortBy as 'price' | 'title' | 'createdAt' | 'rating',
      sortOrder: (sortOrder || 'desc') as 'asc' | 'desc',
    };
  });

export type GetJerseysQuery = z.infer<typeof getJerseysQuerySchema>;

export const getJerseyBySlugSchema = z.object({
  slug: z.string().min(1, 'Slug parameter is required').trim(),
});
