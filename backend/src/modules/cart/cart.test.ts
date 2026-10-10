import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { KitType, Era, Size, Prisma } from '@prisma/client';

describe('Cart Vertical Slice Integration Tests', () => {
  let testClubId: string;
  let testJerseyId: string;
  let variantMediumId: string;
  let variantLowStockId: string;
  let variantOutOfStockId: string;
  let testUserId: string;

  beforeAll(async () => {
    // 1. Clean test data
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create test user
    const user = await prisma.user.create({
      data: {
        clerkId: 'user_test_clerk_cart_123',
        email: 'cartuser@example.com',
        name: 'Cart Tester',
      },
    });
    testUserId = user.id;

    // 3. Create test club
    const club = await prisma.club.create({
      data: {
        name: 'Arsenal FC',
        slug: 'arsenal-fc-cart-test',
        league: 'Premier League',
        country: 'England',
      },
    });
    testClubId = club.id;

    // 4. Create test jersey with variants
    const jersey = await prisma.jersey.create({
      data: {
        clubId: testClubId,
        title: 'Arsenal 2024/25 Home Kit',
        slug: 'arsenal-2024-25-home-cart-test',
        description: 'Red and white iconic home jersey.',
        kitType: KitType.HOME,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(80.00),
        variants: {
          create: [
            { size: Size.M, stockQuantity: 20, sku: 'AFC-HOME-M-TEST' },
            { size: Size.L, stockQuantity: 2, sku: 'AFC-HOME-L-TEST' },
            { size: Size.XL, stockQuantity: 0, sku: 'AFC-HOME-XL-TEST' },
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
    const xlVar = jersey.variants.find((v) => v.size === Size.XL)!;

    variantMediumId = mVar.id;
    variantLowStockId = lVar.id;
    variantOutOfStockId = xlVar.id;
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/cart', () => {
    it('should initialize a brand-new guest cart with 200 and return x-session-id header', async () => {
      const response = await request(app).get('/api/cart');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.subtotalAmount).toBe(0);
      expect(response.body.data.items).toEqual([]);
      expect(response.headers['x-session-id']).toBeDefined();
    });

    it('should retrieve existing active cart when x-session-id is provided', async () => {
      const initRes = await request(app).get('/api/cart');
      const sessionId = initRes.body.data.sessionId;

      const secondRes = await request(app)
        .get('/api/cart')
        .set('x-session-id', sessionId);

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.id).toBe(initRes.body.data.id);
      expect(secondRes.body.data.sessionId).toBe(sessionId);
    });

    it('should retrieve or initialize active user cart when x-user-id is provided', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(testUserId);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add a standard jersey variant with server-authoritative base price', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalItems).toBe(1);
      expect(response.body.data.subtotalAmount).toBe(80.00);

      const item = response.body.data.items[0];
      expect(item.jerseyVariantId).toBe(variantMediumId);
      expect(item.quantity).toBe(1);
      expect(item.unitPrice).toBe(80.00);
      expect(item.totalPrice).toBe(80.00);
      expect(item.jersey.title).toBe('Arsenal 2024/25 Home Kit');
      expect(item.variant.size).toBe('M');
    });

    it('should accurately calculate custom printing addon (+15 USD)', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
          customName: 'SAKA',
          customNumber: 7,
        });

      expect(response.status).toBe(201);
      const item = response.body.data.items[0];
      // Base: 80.00 + Printing: 15.00 = 95.00
      expect(item.unitPrice).toBe(95.00);
      expect(item.totalPrice).toBe(95.00);
      expect(item.customName).toBe('SAKA');
      expect(item.customNumber).toBe(7);
      expect(response.body.data.subtotalAmount).toBe(95.00);
    });

    it('should accurately calculate sleeve badge addon (+5 USD)', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
          sleeveBadge: 'Premier League Champions',
        });

      expect(response.status).toBe(201);
      const item = response.body.data.items[0];
      // Base: 80.00 + Badge: 5.00 = 85.00
      expect(item.unitPrice).toBe(85.00);
      expect(item.totalPrice).toBe(85.00);
      expect(item.sleeveBadge).toBe('Premier League Champions');
      expect(response.body.data.subtotalAmount).toBe(85.00);
    });

    it('should accurately calculate combined custom printing (+15 USD) and sleeve badge (+5 USD)', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 2,
          customName: 'ODEGAARD',
          customNumber: 8,
          sleeveBadge: 'Champions League Starball',
        });

      expect(response.status).toBe(201);
      const item = response.body.data.items[0];
      // Base: 80.00 + Printing: 15.00 + Badge: 5.00 = 100.00 each
      expect(item.unitPrice).toBe(100.00);
      // 2 * 100.00 = 200.00
      expect(item.totalPrice).toBe(200.00);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.subtotalAmount).toBe(200.00);
    });

    it('should increment quantity when identical item with matching customizations is added', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      // Add first
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
          customName: 'RICE',
          customNumber: 41,
        });

      // Add identical second
      const secondRes = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 2,
          customName: 'RICE',
          customNumber: 41,
        });

      expect(secondRes.status).toBe(201);
      expect(secondRes.body.data.items.length).toBe(1);
      expect(secondRes.body.data.items[0].quantity).toBe(3);
      expect(secondRes.body.data.totalItems).toBe(3);
      // Unit price: 80 + 15 = 95. Total: 95 * 3 = 285.00
      expect(secondRes.body.data.items[0].totalPrice).toBe(285.00);
      expect(secondRes.body.data.subtotalAmount).toBe(285.00);
    });

    it('should keep items as separate lines when same variant has different customizations', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      // Plain jersey
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
        });

      // Custom printed jersey
      const secondRes = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
          customName: 'HAVERTZ',
          customNumber: 29,
        });

      expect(secondRes.status).toBe(201);
      expect(secondRes.body.data.items.length).toBe(2);
      expect(secondRes.body.data.totalItems).toBe(2);
      // Line 1: 80.00, Line 2: 95.00. Subtotal: 175.00
      expect(secondRes.body.data.subtotalAmount).toBe(175.00);
    });

    it('should reject addition with 400 when requested quantity exceeds available stock', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      // variantLowStockId has stock = 2
      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantLowStockId,
          quantity: 3,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exceeds available stock');
    });

    it('should reject addition with 400 when variant is out of stock (stock = 0)', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantOutOfStockId,
          quantity: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('out of stock');
    });

    it('should return 404 when jerseyVariantId does not exist', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 on invalid payload (e.g., negative quantity, non-uuid)', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: 'invalid-id',
          quantity: -2,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation Error');
    });
  });

  describe('PATCH /api/cart/items/:itemId', () => {
    it('should update line item quantity and recalculate cart totals', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
        });

      const itemId = addRes.body.data.items[0].id;

      const patchRes = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set('x-session-id', sessionId)
        .send({ quantity: 4 });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.totalItems).toBe(4);
      expect(patchRes.body.data.subtotalAmount).toBe(320.00); // 4 * 80.00
      expect(patchRes.body.data.items[0].quantity).toBe(4);
    });

    it('should reject update with 400 when new quantity exceeds stock', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      // variantLowStockId has stock = 2
      const addRes = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantLowStockId,
          quantity: 1,
        });

      const itemId = addRes.body.data.items[0].id;

      const patchRes = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set('x-session-id', sessionId)
        .send({ quantity: 10 });

      expect(patchRes.status).toBe(400);
      expect(patchRes.body.message).toContain('exceeds available stock');
    });

    it('should return 404 when updating non-existent item ID', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const patchRes = await request(app)
        .patch('/api/cart/items/00000000-0000-0000-0000-000000000000')
        .set('x-session-id', sessionId)
        .send({ quantity: 2 });

      expect(patchRes.status).toBe(404);
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    it('should remove specific item and recalculate totals', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const addRes = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 2,
        });

      const itemId = addRes.body.data.items[0].id;

      const deleteRes = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('x-session-id', sessionId);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.totalItems).toBe(0);
      expect(deleteRes.body.data.subtotalAmount).toBe(0);
      expect(deleteRes.body.data.items).toEqual([]);
    });

    it('should return 404 when removing non-existent item ID', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      const deleteRes = await request(app)
        .delete('/api/cart/items/00000000-0000-0000-0000-000000000000')
        .set('x-session-id', sessionId);

      expect(deleteRes.status).toBe(404);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should empty entire cart and reset summary', async () => {
      const sessionRes = await request(app).get('/api/cart');
      const sessionId = sessionRes.body.data.sessionId;

      // Add two different items
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
        });

      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          jerseyVariantId: variantMediumId,
          quantity: 1,
          customName: 'TIMBER',
          customNumber: 12,
        });

      const clearRes = await request(app)
        .delete('/api/cart')
        .set('x-session-id', sessionId);

      expect(clearRes.status).toBe(200);
      expect(clearRes.body.data.totalItems).toBe(0);
      expect(clearRes.body.data.subtotalAmount).toBe(0);
      expect(clearRes.body.data.items.length).toBe(0);
    });
  });
});
