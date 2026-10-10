import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { paymentService } from './payment.service.js';
import { createPaymentIntentSchema } from './payment.schemas.js';

function getPaymentSessionContext(req: Request) {
  const sessionId = (req.headers['x-session-id'] as string)?.trim() || undefined;
  const userId = req.user?.id || (req.headers['x-user-id'] as string)?.trim() || undefined;
  const userEmail = req.user?.email || undefined;

  return { sessionId, userId, userEmail };
}

/**
 * POST /api/payments/create-intent
 * Creates Stripe PaymentIntent with server-authoritative price verification and stock checks
 */
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const sessionContext = getPaymentSessionContext(req);
  const validatedInput = createPaymentIntentSchema.parse(req.body);

  const result = await paymentService.createPaymentIntent(sessionContext, validatedInput);

  res.status(201).json(
    new ApiResponse(201, result, 'Payment intent created successfully')
  );
});

/**
 * POST /api/webhooks/stripe
 * Ingests Stripe payment events with signature verification & atomic inventory decrements
 */
export const handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const signature = req.headers['stripe-signature'] as string | undefined;

  if (!signature) {
    throw new ApiError(400, 'Missing Stripe-Signature header');
  }

  const event = paymentService.verifyStripeWebhookSignature(rawBody, signature);
  const result = await paymentService.handleStripeWebhookEvent(event);

  res.status(200).json(
    new ApiResponse(200, result, 'Stripe webhook event processed successfully')
  );
});
