import { z } from 'zod';
import { KitType, Size } from '@prisma/client';

export const searchJerseysToolSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  league: z.string().optional(),
  kitType: z.nativeEnum(KitType).optional(),
  maxPrice: z.number().positive().optional(),
});

export type SearchJerseysToolInput = z.infer<typeof searchJerseysToolSchema>;

export const addToCartToolSchema = z.object({
  jerseyId: z.string().uuid('Valid jerseyId is required'),
  size: z.nativeEnum(Size),
  quantity: z.number().int().positive().default(1),
  customName: z.string().max(20).optional(),
  customNumber: z.number().int().min(0).max(99).optional(),
  hasBadge: z.boolean().default(false),
});

export type AddToCartToolInput = z.infer<typeof addToCartToolSchema>;

export const getCartSummaryToolSchema = z.object({}).default({});

export type GetCartSummaryToolInput = z.infer<typeof getCartSummaryToolSchema>;

export const recommendSizeToolSchema = z.object({
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(200),
  fitPreference: z.enum(['slim', 'regular', 'relaxed']).default('regular'),
});

export type RecommendSizeToolInput = z.infer<typeof recommendSizeToolSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().min(1).default(() => 'guest-session-' + Date.now()),
  guestSessionId: z.string().optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
