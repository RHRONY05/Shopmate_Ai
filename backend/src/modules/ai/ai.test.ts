import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { KitType, Era, Size, Prisma } from '@prisma/client';
import { AIMemoryService } from './ai.memory.js';
import { AIService } from './ai.service.js';
import {
  executeRecommendSize,
  executeAddToCart,
  executeGetCartSummary,
  executeSearchJerseys,
} from './ai.tools.js';
import { EmbeddingService } from '../../services/embeddingService.js';

describe('AI Shopping Agent Engine Integration Tests', () => {
  let clubId: string;
  let jerseyId: string;
  let variantMId: string;

  beforeAll(async () => {
    // 1. Clean previous state
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();

    // 2. Create club
    const club = await prisma.club.create({
      data: {
        name: 'Chelsea FC',
        slug: 'chelsea-fc-ai-test',
        league: 'Premier League',
        country: 'England',
      },
    });
    clubId = club.id;

    // 3. Create jersey with variants
    const jersey = await prisma.jersey.create({
      data: {
        clubId,
        title: 'Chelsea 2024/25 Home Shirt',
        slug: 'chelsea-2024-home-ai-test',
        description: 'Vibrant blue matchday home jersey with flame patterning.',
        kitType: KitType.HOME,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(80.0),
        images: ['https://example.com/chelsea.jpg'],
        variants: {
          create: [
            { size: Size.M, stockQuantity: 5, sku: 'CHE-M-AI-TEST' },
            { size: Size.L, stockQuantity: 0, sku: 'CHE-L-AI-TEST' },
          ],
        },
      },
      include: { variants: true },
    });
    jerseyId = jersey.id;
    variantMId = jersey.variants.find((v) => v.size === Size.M)!.id;
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
  });

  describe('1. AI Tools Unit & Functional Execution', () => {
    it('recommends medium size for average height and regular fit', async () => {
      const rec = await executeRecommendSize({
        heightCm: 175,
        weightKg: 72,
        fitPreference: 'regular',
      });

      expect(rec.recommendedSize).toBe(Size.M);
      expect(rec.advice).toContain('size M is recommended');
    });

    it('recommends size L when user prefers relaxed fit', async () => {
      const rec = await executeRecommendSize({
        heightCm: 175,
        weightKg: 72,
        fitPreference: 'relaxed',
      });

      expect(rec.recommendedSize).toBe(Size.L);
    });

    it('adds jersey to cart successfully with customization and badge', async () => {
      const guestSessionId = 'ai-test-guest-session-1';

      const result = await executeAddToCart(
        {
          jerseyId,
          size: Size.M,
          quantity: 1,
          customName: 'PALMER',
          customNumber: 20,
          hasBadge: true,
        },
        { guestSessionId }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Added 1x Chelsea 2024/25 Home Shirt');
      // Base (80) + Printing (15) + Badge (5) = 100 USD
      expect(result.cartSummary?.totalAmountUsd).toBe(100);
    });

    it('rejects adding out-of-stock size to cart', async () => {
      const guestSessionId = 'ai-test-guest-session-2';

      const result = await executeAddToCart(
        {
          jerseyId,
          size: Size.L, // stockQuantity is 0
          quantity: 1,
        },
        { guestSessionId }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds available stock');
    });

    it('retrieves cart summary with accurate item details', async () => {
      const guestSessionId = 'ai-test-guest-session-1';

      const summary = await executeGetCartSummary({ guestSessionId });
      expect(summary.totalItems).toBe(1);
      expect(summary.subtotalUsd).toBe(100);
      expect(summary.items[0].customName).toBe('PALMER');
      expect(summary.items[0].customNumber).toBe(20);
      expect(summary.items[0].sleeveBadge).toBe('Official Tournament Badge');
    });

    it('executes search_jerseys delegating to EmbeddingService', async () => {
      vi.spyOn(EmbeddingService, 'findSimilarJerseys').mockResolvedValueOnce([
        {
          id: jerseyId,
          title: 'Chelsea 2024/25 Home Shirt',
          slug: 'chelsea-2024-home-ai-test',
          description: 'Vibrant blue matchday home jersey',
          basePrice: 80,
          images: [],
          kitType: 'HOME',
          season: '2024/25',
          era: 'MODERN',
          clubName: 'Chelsea FC',
          league: 'Premier League',
          similarity: 0.95,
          availableSizes: [{ size: 'M', stockQuantity: 5 }],
        },
      ]);

      const searchResult = await executeSearchJerseys({ query: 'blue chelsea jersey' });
      expect(searchResult.count).toBe(1);
      expect(searchResult.jerseys[0].title).toBe('Chelsea 2024/25 Home Shirt');
      expect(searchResult.jerseys[0].priceUsd).toBe(80);
    });
  });

  describe('2. Redis AI Session Memory Retention', () => {
    const testSessionId = 'redis-memory-test-session';

    afterAll(async () => {
      await AIMemoryService.clearSessionHistory(testSessionId);
    });

    it('stores and retrieves multi-turn messages from Redis', async () => {
      const messages = [
        { role: 'user' as const, parts: [{ text: 'Hello, looking for a blue shirt' }] },
        { role: 'model' as const, parts: [{ text: 'We have the Chelsea 2024/25 Home Kit!' }] },
      ];

      await AIMemoryService.saveSessionHistory(testSessionId, messages);

      const retrieved = await AIMemoryService.getSessionHistory(testSessionId);
      expect(retrieved.length).toBe(2);
      expect(retrieved[0].parts[0].text).toBe('Hello, looking for a blue shirt');
      expect(retrieved[1].parts[0].text).toBe('We have the Chelsea 2024/25 Home Kit!');
    });

    it('clears session history cleanly from Redis', async () => {
      await AIMemoryService.clearSessionHistory(testSessionId);
      const empty = await AIMemoryService.getSessionHistory(testSessionId);
      expect(empty).toEqual([]);
    });
  });

  describe('3. POST /api/ai/chat SSE Streaming Controller', () => {
    it('returns 400 Bad Request when message is empty', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('streams SSE headers and completed event on successful chat', async () => {
      // Mock AIService.streamChat to execute deterministic SSE callbacks without external API calls
      vi.spyOn(AIService, 'streamChat').mockImplementationOnce(
        async (_sessionId, _message, _ctx, callbacks) => {
          callbacks.onChunk?.('Hello from your Kitroom Stylist!');
          callbacks.onDone?.({ sessionId: 'mock-session-id' });
        }
      );

      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Can you recommend a blue kit?',
          sessionId: 'sse-test-session',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.headers['cache-control']).toContain('no-cache');
      expect(res.text).toContain(': connected');
      expect(res.text).toContain('event: message');
      expect(res.text).toContain('Hello from your Kitroom Stylist!');
      expect(res.text).toContain('event: done');
    });

    it('streams tool_call and tool_result events when AI calls a tool', async () => {
      vi.spyOn(AIService, 'streamChat').mockImplementationOnce(
        async (_sessionId, _message, _ctx, callbacks) => {
          callbacks.onToolCall?.({
            name: 'search_jerseys',
            args: { query: 'Chelsea home' },
          });
          callbacks.onToolResult?.({
            name: 'search_jerseys',
            result: { count: 1 },
          });
          callbacks.onChunk?.('I found the Chelsea 2024/25 Home Shirt for you!');
          callbacks.onDone?.({ sessionId: 'mock-session-tool' });
        }
      );

      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Find Chelsea shirts',
          sessionId: 'sse-tool-session',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('event: tool_call');
      expect(res.text).toContain('search_jerseys');
      expect(res.text).toContain('event: tool_result');
      expect(res.text).toContain('event: message');
      expect(res.text).toContain('event: done');
    });
  });
});
