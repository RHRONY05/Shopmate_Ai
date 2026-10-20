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

/**
 * GET /api/orders/:orderId
 * Retrieves order details by orderId or orderNumber
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const order = await paymentService.getOrderById(orderId);

  res.status(200).json(
    new ApiResponse(200, order, 'Order details retrieved successfully')
  );
});

/**
 * GET /api/orders
 * Retrieves list of orders for the authenticated user or guest email
 */
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || (req.headers['x-user-id'] as string) || undefined;
  const guestEmail = (req.query.email as string) || undefined;

  const orders = await paymentService.getUserOrders(userId, guestEmail);

  res.status(200).json(
    new ApiResponse(200, orders, 'User orders retrieved successfully')
  );
});

/**
 * POST /api/payments/confirm
 * Client-side fallback to confirm order directly after Stripe Elements payment completion
 */
export const confirmClientPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    throw new ApiError(400, 'paymentIntentId is required');
  }

  const order = await paymentService.confirmOrderFromClient(paymentIntentId);

  res.status(200).json(
    new ApiResponse(200, order, 'Payment confirmed and order created successfully')
  );
});
