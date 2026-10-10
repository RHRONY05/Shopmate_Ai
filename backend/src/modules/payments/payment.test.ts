import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { stripe } from '../../config/stripe.js';
import { config } from '../../config/env.js';
import { KitType, Era, Size, Prisma } from '@prisma/client';

describe('Payment Vertical Slice Integration Tests (Stripe PaymentIntent & Webhooks)', () => {
  let testClubId: string;
  let testJerseyId: string;
  let variantNormalStockId: string;
  let variantLowStockId: string;
  let testUserId: string;
  const testClerkId = 'user_clerk_payment_tester_77';
  const testWebhookSecret = 'whsec_test_stripe_webhook_secret_999';

  // Spy on Stripe paymentIntents.create
  let stripeCreateSpy: any;

  beforeAll(async () => {
    config.stripe.webhookSecret = testWebhookSecret;

    // 1. Clean test data
    await prisma.processedWebhookEvent.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    // 2. Setup Stripe Spy for PaymentIntent creation
    stripeCreateSpy = vi.spyOn(stripe.paymentIntents, 'create').mockImplementation(async (params: any) => {
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_test`,
        amount: params.amount,
        currency: params.currency,
        metadata: params.metadata,
      } as any;
    });

    // 3. Create test user
    const user = await prisma.user.create({
      data: {
        clerkId: testClerkId,
        email: 'payer@example.com',
        name: 'Alex Payer',
      },
    });
    testUserId = user.id;

    // 4. Create test club & jersey
    const club = await prisma.club.create({
      data: {
        name: 'Chelsea FC',
        slug: 'chelsea-fc-pay-test',
        league: 'Premier League',
        country: 'England',
      },
    });
    testClubId = club.id;

    const jersey = await prisma.jersey.create({
      data: {
        clubId: testClubId,
        title: 'Chelsea 2024/25 Home Kit',
        slug: 'chelsea-2024-25-home-pay-test',
        description: 'Royal blue home kit.',
        kitType: KitType.HOME,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(80.00),
        variants: {
          create: [
            { size: Size.M, stockQuantity: 20, sku: 'CFC-HOME-M-TEST' },
            { size: Size.L, stockQuantity: 5, sku: 'CFC-HOME-L-TEST' },
          ],
        },
      },
      include: {
        variants: true,
      },
    });
    testJerseyId = jersey.id;

    const mVar = jersey.variants.find((v) => v.size === Size.M)!;
    const lVar = jersey.variants.find((v) => v.size === Size.L)!;
    variantNormalStockId = mVar.id;
    variantLowStockId = lVar.id;
  });

  afterAll(async () => {
    stripeCreateSpy.mockRestore();
    await prisma.processedWebhookEvent.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/payments/create-intent', () => {
    it('should return 404 when active cart does not exist', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-session-id', '00000000-0000-0000-0000-000000000000')
        .send({ guestEmail: 'guest@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cart not found');
    });

    it('should return 400 Bad Request when cart is empty', async () => {
      const cartRes = await request(app).get('/api/cart');
      const sessionId = cartRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-session-id', sessionId)
        .send({ guestEmail: 'guest@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('empty cart');
    });

    it('should return 400 Bad Request when customer email is missing for guest checkout', async () => {
      const cartRes = await request(app).get('/api/cart');
      const sessionId = cartRes.body.data.sessionId;

      // Add item to guest cart
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantNormalStockId,
          quantity: 1,
        });

      // Attempt checkout without email
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-session-id', sessionId)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email is required');
    });

    it('should successfully create PaymentIntent for guest user with server-authoritative base price', async () => {
      const cartRes = await request(app).get('/api/cart');
      const sessionId = cartRes.body.data.sessionId;

      // Add 2 base jerseys (80.00 each -> 160.00 USD)
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantNormalStockId,
          quantity: 2,
        });

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-session-id', sessionId)
        .send({
          guestEmail: 'supporter@example.com',
          shippingAddress: {
            street: '10 Stamford Bridge Rd',
            city: 'London',
            postalCode: 'SW6 1HS',
            country: 'GB',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('clientSecret');
      expect(response.body.data).toHaveProperty('paymentIntentId');
      expect(response.body.data.amount).toBe(160.00);
      expect(response.body.data.amountInCents).toBe(16000); // 160.00 * 100
      expect(response.body.data.currency).toBe('usd');

      // Verify Stripe SDK received the exact verified amount in cents
      expect(stripeCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 16000,
          currency: 'usd',
          receipt_email: 'supporter@example.com',
          metadata: expect.objectContaining({
            cartId: cartRes.body.data.id,
            totalItems: '2',
            guestEmail: 'supporter@example.com',
          }),
        })
      );
    });

    it('should accurately calculate custom printing (+15 USD) and sleeve badge (+5 USD) in Stripe amount', async () => {
      // Create authenticated cart
      const cartRes = await request(app)
        .get('/api/cart')
        .set('x-mock-clerk-id', testClerkId);

      // Add jersey with custom printing & badge
      // Base (80.00) + Printing (15.00) + Badge (5.00) = 100.00 USD
      await request(app)
        .post('/api/cart/items')
        .set('x-mock-clerk-id', testClerkId)
        .send({
          jerseyVariantId: variantNormalStockId,
          quantity: 1,
          customName: 'PALMER',
          customNumber: 20,
          sleeveBadge: 'Premier League',
        });

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-mock-clerk-id', testClerkId)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.data.amount).toBe(100.00);
      expect(response.body.data.amountInCents).toBe(10000); // 100.00 * 100

      expect(stripeCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: 'usd',
          receipt_email: 'payer@example.com',
          metadata: expect.objectContaining({
            userId: testUserId,
          }),
        })
      );
    });

    it('should reject payment intent creation if cart items exceed active stock', async () => {
      const cartRes = await request(app).get('/api/cart');
      const sessionId = cartRes.body.data.sessionId;

      // Add 1 item of low stock variant (stock = 5)
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantLowStockId,
          quantity: 1,
        });

      // Simulate stock reduction elsewhere to 0
      await prisma.jerseyVariant.update({
        where: { id: variantLowStockId },
        data: { stockQuantity: 0 },
      });

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('x-session-id', sessionId)
        .send({ guestEmail: 'buyer@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('only has 0 item(s) in stock');

      // Reset stock for subsequent tests
      await prisma.jerseyVariant.update({
        where: { id: variantLowStockId },
        data: { stockQuantity: 5 },
      });
    });
  });

  describe('POST /api/webhooks/stripe (Payment Confirmation & Atomic Locks)', () => {
    function generateSignedStripeWebhook(eventObj: object) {
      const payloadString = JSON.stringify(eventObj);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: testWebhookSecret,
      });

      return { payloadString, signature };
    }

    it('should return 400 Bad Request when Stripe-Signature header is missing', async () => {
      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send({ type: 'payment_intent.succeeded' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing Stripe-Signature header');
    });

    it('should return 400 Bad Request when Stripe signature is forged/invalid', async () => {
      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 't=12345,v1=fake_signature_hash')
        .send({ type: 'payment_intent.succeeded' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('signature verification failed');
    });

    it('should process payment_intent.succeeded with atomic stock decrement, order creation, and cart conversion', async () => {
      // 1. Setup a real cart with 2 items
      const initialVariant = await prisma.jerseyVariant.findUniqueOrThrow({
        where: { id: variantNormalStockId },
      });
      const initialStock = initialVariant.stockQuantity; // e.g. 20

      const cartRes = await request(app).get('/api/cart');
      const sessionId = cartRes.body.data.sessionId;
      const cartId = cartRes.body.data.id;

      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantNormalStockId,
          quantity: 2,
          customName: 'JACKSON',
          customNumber: 15,
        });

      // 2. Prepare Stripe webhook event
      const eventId = `evt_stripe_succ_${Date.now()}`;
      const paymentIntentId = `pi_stripe_succ_${Date.now()}`;

      const stripeEvent = {
        id: eventId,
        object: 'event',
        api_version: '2024-06-20',
        created: Math.floor(Date.now() / 1000),
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentIntentId,
            object: 'payment_intent',
            amount: 19000, // 2 * (80 + 15) = 190.00 USD
            currency: 'usd',
            receipt_email: 'buyer@example.com',
            metadata: {
              cartId,
              guestEmail: 'buyer@example.com',
            },
          },
        },
      };

      const { payloadString, signature } = generateSignedStripeWebhook(stripeEvent);

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', signature)
        .set('content-type', 'application/json')
        .send(payloadString);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('processed');

      // 3. Verify Atomic Stock Decrement
      const updatedVariant = await prisma.jerseyVariant.findUniqueOrThrow({
        where: { id: variantNormalStockId },
      });
      expect(updatedVariant.stockQuantity).toBe(initialStock - 2);

      // 4. Verify Permanent Order and OrderItem Creation
      const createdOrder = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { items: true },
      });
      expect(createdOrder).toBeDefined();
      expect(createdOrder?.status).toBe('PAID');
      expect(Number(createdOrder?.totalAmount)).toBe(190.00);
      expect(createdOrder?.items.length).toBe(1);
      expect(createdOrder?.items[0].quantity).toBe(2);
      expect(createdOrder?.items[0].customName).toBe('JACKSON');
      expect(createdOrder?.items[0].customNumber).toBe(15);

      // 5. Verify Cart transitioned to CONVERTED
      const updatedCart = await prisma.cart.findUnique({
        where: { id: cartId },
      });
      expect(updatedCart?.status).toBe('CONVERTED');

      // 6. Verify Processed Webhook Event Idempotency Record
      const eventRecord = await prisma.processedWebhookEvent.findUnique({
        where: { eventId },
      });
      expect(eventRecord).toBeDefined();
      expect(eventRecord?.source).toBe('STRIPE');
    });

    it('should guarantee webhook idempotency and skip duplicate processing on repeated delivery', async () => {
      const eventId = `evt_stripe_idemp_${Date.now()}`;
      const duplicateEvent = {
        id: eventId,
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_idemp_${Date.now()}`,
            amount: 5000,
            currency: 'usd',
            metadata: {
              cartId: 'non-existent-cart',
            },
          },
        },
      };

      // Manually seed existing processed event
      await prisma.processedWebhookEvent.create({
        data: {
          eventId,
          eventType: 'payment_intent.succeeded',
          source: 'STRIPE',
        },
      });

      const { payloadString, signature } = generateSignedStripeWebhook(duplicateEvent);

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', signature)
        .set('content-type', 'application/json')
        .send(payloadString);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('already_processed');
    });
  });
});
