import { z } from 'zod';

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, 'Recipient name is required').optional(),
  street: z.string().trim().min(1, 'Street address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(1, 'Postal/ZIP code is required'),
  country: z.string().trim().min(2, 'Country code is required'),
});

export const createPaymentIntentSchema = z.object({
  cartId: z.string().uuid({ message: 'Valid cartId (UUID) is required' }).optional(),
  guestEmail: z.string().trim().email('Valid email is required').optional(),
  shippingAddress: shippingAddressSchema.optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
