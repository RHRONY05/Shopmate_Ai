import type Stripe from 'stripe';
import { stripe } from '../../config/stripe.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { config } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { Prisma } from '@prisma/client';
import { cartIncludeQuery, CUSTOM_PRINTING_PRICE, SLEEVE_BADGE_PRICE } from '../cart/cart.service.js';
import type { CreatePaymentIntentInput } from './payment.schemas.js';

interface SessionContext {
  sessionId?: string;
  userId?: string;
  userEmail?: string;
}

export class PaymentService {
  /**
   * Creates a Stripe PaymentIntent with server-authoritative price verification and stock checks
   */
  async createPaymentIntent(sessionContext: SessionContext, input: CreatePaymentIntentInput) {
    // 1. Resolve Cart
    let cart;
    if (input.cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: input.cartId },
        include: cartIncludeQuery,
      });
    } else if (sessionContext.userId) {
      cart = await prisma.cart.findFirst({
        where: { userId: sessionContext.userId, status: 'ACTIVE' },
        include: cartIncludeQuery,
      });
    } else if (sessionContext.sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId: sessionContext.sessionId },
        include: cartIncludeQuery,
      });
    }

    if (!cart) {
      throw new ApiError(404, 'Active shopping cart not found');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Cannot initialize checkout with an empty cart');
    }

    // 2. Resolve Customer Email
    const customerEmail = sessionContext.userEmail || input.guestEmail;
    if (!customerEmail) {
      throw new ApiError(400, 'Customer email is required to process payment');
    }

    // 3. Real-Time Stock Verification & Server-Authoritative Price Calculation
    let calculatedTotal = 0;
    let totalQuantity = 0;

    for (const item of cart.items) {
      const variant = item.jerseyVariant;

      // Check stock sufficiency
      if (item.quantity > variant.stockQuantity) {
        throw new ApiError(
          400,
          `Cannot proceed to payment: '${variant.jersey.title}' (${variant.size}) only has ${variant.stockQuantity} item(s) in stock, but your cart has ${item.quantity}.`
        );
      }

      // Re-calculate verified unit price directly from catalog data (server-authoritative)
      const basePrice = Number(variant.jersey.basePrice);
      const hasCustomPrinting = Boolean(item.customName || (item.customNumber !== null && item.customNumber !== undefined));
      const hasBadge = Boolean(item.sleeveBadge);

      const printingCost = hasCustomPrinting ? CUSTOM_PRINTING_PRICE : 0;
      const badgeCost = hasBadge ? SLEEVE_BADGE_PRICE : 0;
      const unitPrice = basePrice + printingCost + badgeCost;

      const itemTotal = Number((unitPrice * item.quantity).toFixed(2));
      calculatedTotal += itemTotal;
      totalQuantity += item.quantity;
    }

    // Round to 2 decimals
    const finalAmountInDollars = Number(calculatedTotal.toFixed(2));
    const amountInCents = Math.round(finalAmountInDollars * 100);

    if (amountInCents < 50) {
      throw new ApiError(400, 'Cart total is below the minimum Stripe charge amount of 0.50 USD');
    }

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: {
        cartId: cart.id,
        userId: sessionContext.userId || '',
        sessionId: cart.sessionId || '',
        totalItems: totalQuantity.toString(),
        guestEmail: input.guestEmail || '',
      },
      description: `ShopMate AI Football Kit Order (${totalQuantity} items)`,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmountInDollars,
      amountInCents,
      currency: 'usd',
      cartId: cart.id,
    };
  }

  /**
   * Verifies the cryptographic Stripe webhook signature using raw payload buffer
   */
  verifyStripeWebhookSignature(
    rawBody: string | Buffer,
    signatureHeader: string,
    overrideSecret?: string
  ): Stripe.Event {
    const webhookSecret = overrideSecret || config.stripe.webhookSecret;

    if (!webhookSecret) {
      throw new ApiError(500, 'Stripe webhook secret is not configured in backend environment');
    }

    try {
      return stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      logger.warn({ err }, `[PAYMENT] Stripe webhook signature verification failed: ${message}`);
      throw new ApiError(400, `Stripe webhook signature verification failed: ${message}`);
    }
  }

  /**
   * Processes verified Stripe webhook events with transaction safety,
   * atomic inventory deduction, and idempotency guarantees.
   */
  async handleStripeWebhookEvent(event: Stripe.Event) {
    const eventId = event.id;

    // 1. Strict Idempotency Check
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      logger.info({ eventId }, '[PAYMENT] Stripe webhook event already processed. Skipping duplicate.');
      return { eventId, status: 'already_processed' };
    }

    // 2. Handle Event Types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const cartId = paymentIntent.metadata?.cartId;
        const userId = paymentIntent.metadata?.userId || null;
        const guestEmail = paymentIntent.metadata?.guestEmail || paymentIntent.receipt_email || null;

        if (!cartId) {
          logger.warn({ paymentIntentId: paymentIntent.id }, '[PAYMENT] PaymentIntent metadata missing cartId. Skipping order creation.');
          break;
        }

        // Execute atomic multi-step mutations inside interactive transaction
        await prisma.$transaction(async (tx) => {
          // Fetch cart with items and variant stock
          const cart = await tx.cart.findUnique({
            where: { id: cartId },
            include: {
              items: {
                include: {
                  jerseyVariant: true,
                },
              },
            },
          });

          if (!cart) {
            throw new ApiError(404, `Cart with ID '${cartId}' not found during payment confirmation`);
          }

          if (cart.status === 'CONVERTED') {
            logger.info({ cartId }, '[PAYMENT] Cart was already converted to order.');
            return;
          }

          // Atomic stock decrement with condition check (stockQuantity >= requestedQuantity)
          for (const item of cart.items) {
            const updated = await tx.jerseyVariant.updateMany({
              where: {
                id: item.jerseyVariantId,
                stockQuantity: { gte: item.quantity },
              },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });

            if (updated.count === 0) {
              throw new ApiError(
                409,
                `Stock lock conflict: Variant ${item.jerseyVariantId} has insufficient stock for deduction.`
              );
            }
          }

          // Create permanent Order record
          const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const amountInDollars = Number((paymentIntent.amount / 100).toFixed(2));

          await tx.order.create({
            data: {
              orderNumber,
              userId: cart.userId || (userId && userId.length > 0 ? userId : null),
              guestEmail,
              status: 'PAID',
              totalAmount: new Prisma.Decimal(amountInDollars),
              stripePaymentIntentId: paymentIntent.id,
              shippingAddress: (paymentIntent.shipping as unknown as Prisma.InputJsonValue) || undefined,
              items: {
                create: cart.items.map((item) => ({
                  jerseyVariantId: item.jerseyVariantId,
                  quantity: item.quantity,
                  customName: item.customName,
                  customNumber: item.customNumber,
                  sleeveBadge: item.sleeveBadge,
                  priceAtPurchase: item.unitPrice,
                })),
              },
            },
          });

          // Mark cart as converted
          await tx.cart.update({
            where: { id: cart.id },
            data: { status: 'CONVERTED' },
          });

          // Record event in processed events
          await tx.processedWebhookEvent.create({
            data: {
              eventId,
              eventType: event.type,
              source: 'STRIPE',
            },
          });
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn({ paymentIntentId: paymentIntent.id }, '[PAYMENT] Customer payment attempt failed.');

        await prisma.processedWebhookEvent.create({
          data: {
            eventId,
            eventType: event.type,
            source: 'STRIPE',
          },
        });
        break;
      }

      default:
        logger.info({ type: event.type }, `[PAYMENT] Unhandled Stripe webhook event type: ${event.type}`);
    }

    return { eventId, status: 'processed', eventType: event.type };
  }

  /**
   * Retrieves an order by ID, orderNumber, or Stripe PaymentIntent ID
   */
  async getOrderById(orderIdOrNumber: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdOrNumber },
          { orderNumber: orderIdOrNumber },
          { stripePaymentIntentId: orderIdOrNumber },
        ],
      },
      include: {
        items: {
          include: {
            jerseyVariant: {
              include: {
                jersey: {
                  include: {
                    club: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, `Order '${orderIdOrNumber}' not found`);
    }

    return order;
  }

  /**
   * Retrieves order history for a logged in user or guest email
   */
  async getUserOrders(userId?: string, guestEmail?: string) {
    if (!userId && !guestEmail) {
      return [];
    }

    const conditions = [];
    if (userId) conditions.push({ userId });
    if (guestEmail) conditions.push({ guestEmail });

    return prisma.order.findMany({
      where: {
        OR: conditions,
      },
      include: {
        items: {
          include: {
            jerseyVariant: {
              include: {
                jersey: {
                  include: {
                    club: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Directly confirms an order from a verified client-side Stripe payment confirmation
   * for local development and seamless browser checkout testing
   */
  async confirmOrderFromClient(paymentIntentId: string) {
    const existing = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        items: {
          include: {
            jerseyVariant: {
              include: {
                jersey: {
                  include: {
                    club: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (existing) return existing;

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      throw new ApiError(400, 'Stripe PaymentIntent is not yet in succeeded status');
    }

    const syntheticEvent: Stripe.Event = {
      id: `evt_client_confirm_${paymentIntentId}`,
      object: 'event',
      api_version: '2025-01-27.acacia' as any,
      created: Math.floor(Date.now() / 1000),
      type: 'payment_intent.succeeded',
      data: {
        object: paymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
    };

    await this.handleStripeWebhookEvent(syntheticEvent);
    return this.getOrderById(paymentIntentId);
  }
}

export const paymentService = new PaymentService();
