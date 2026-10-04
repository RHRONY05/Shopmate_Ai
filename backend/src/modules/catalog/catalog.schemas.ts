import { z } from 'zod';
import { KitType, Era } from '@prisma/client';

export const getJerseysQuerySchema = z.object({
  clubId: z.string().uuid().optional(),
  league: z.string().trim().optional(),
  kitType: z.nativeEnum(KitType).optional(),
  era: z.nativeEnum(Era).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['price', 'title', 'createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type GetJerseysQuery = z.infer<typeof getJerseysQuerySchema>;

export const getJerseyBySlugSchema = z.object({
  slug: z.string().min(1, 'Slug parameter is required').trim(),
});
