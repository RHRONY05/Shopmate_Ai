import { z } from 'zod';

export const addItemToCartSchema = z.object({
  jerseyVariantId: z.string().uuid({ message: 'Valid jerseyVariantId (UUID) is required' }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  customName: z
    .string()
    .trim()
    .max(15, 'Custom name must not exceed 15 characters')
    .toUpperCase()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val.trim() : null)),
  customNumber: z
    .coerce
    .number()
    .int()
    .min(0, 'Custom number cannot be negative')
    .max(99, 'Custom number must be between 0 and 99')
    .optional()
    .nullable(),
  sleeveBadge: z
    .string()
    .trim()
    .max(50, 'Sleeve badge must not exceed 50 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val.trim() : null)),
});

export type AddItemToCartInput = z.infer<typeof addItemToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemParamSchema = z.object({
  itemId: z.string().uuid({ message: 'Valid itemId (UUID) is required' }),
});
