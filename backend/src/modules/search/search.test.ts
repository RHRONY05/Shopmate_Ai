import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { KitType, Era, Size, Prisma } from '@prisma/client';
import { EmbeddingService } from '../../services/embeddingService.js';

describe('Search Module - Semantic pgvector Search Integration Tests', () => {
  let club1Id: string;
  let club2Id: string;
  let jersey1Id: string;
  let jersey2Id: string;

  // 768-dimensional normalized unit vector mocks
  const mockVectorHome = new Array(768).fill(0.036); // Norm is close to 1
  const mockVectorAway = new Array(768).fill(-0.036);

  beforeAll(async () => {
    // 1. Clean previous test artifacts
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();

    // 2. Create Clubs
    const club1 = await prisma.club.create({
      data: {
        name: 'Arsenal FC',
        slug: 'arsenal-fc-search-test',
        league: 'Premier League',
        country: 'England',
      },
    });
    club1Id = club1.id;

    const club2 = await prisma.club.create({
      data: {
        name: 'Real Madrid',
        slug: 'real-madrid-search-test',
        league: 'La Liga',
        country: 'Spain',
      },
    });
    club2Id = club2.id;

    // 3. Create Jerseys
    const jersey1 = await prisma.jersey.create({
      data: {
        clubId: club1Id,
        title: 'Arsenal 2024/25 Home Shirt',
        slug: 'arsenal-2024-home-search-test',
        description: 'Iconic red body with pure white sleeves and cannon crest.',
        kitType: KitType.HOME,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(85.0),
        images: ['https://example.com/arsenal-home.jpg'],
        variants: {
          create: [
            { size: Size.M, stockQuantity: 8, sku: 'ARS-HOME-M' },
            { size: Size.L, stockQuantity: 4, sku: 'ARS-HOME-L' },
          ],
        },
      },
    });
    jersey1Id = jersey1.id;

    const jersey2 = await prisma.jersey.create({
      data: {
        clubId: club2Id,
        title: 'Real Madrid 2024/25 Away Shirt',
        slug: 'real-madrid-2024-away-search-test',
        description: 'Vibrant orange away kit celebrating contemporary energy.',
        kitType: KitType.AWAY,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(110.0),
        images: ['https://example.com/rm-away.jpg'],
        variants: {
          create: [
            { size: Size.XL, stockQuantity: 3, sku: 'RMA-AWAY-XL' },
          ],
        },
      },
    });
    jersey2Id = jersey2.id;

    // 4. Seed pgvector Embeddings directly via EmbeddingService
    await EmbeddingService.upsertJerseyEmbedding(
      jersey1Id,
      'Club: Arsenal FC | Jersey: Arsenal 2024/25 Home Shirt',
      mockVectorHome
    );

    await EmbeddingService.upsertJerseyEmbedding(
      jersey2Id,
      'Club: Real Madrid | Jersey: Real Madrid 2024/25 Away Shirt',
      mockVectorAway
    );
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

  it('rejects missing or empty query q with 400 Bad Request', async () => {
    const res = await request(app).get('/api/search/semantic');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('performs semantic search matching Arsenal home kit with high similarity', async () => {
    // Mock the Gemini embedding generation to return mockVectorHome
    vi.spyOn(EmbeddingService, 'generateEmbedding').mockResolvedValueOnce(mockVectorHome);

    const res = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'red shirt with white sleeves' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toBeInstanceOf(Array);
    expect(res.body.data.results.length).toBeGreaterThanOrEqual(1);

    const topMatch = res.body.data.results[0];
    expect(topMatch.title).toBe('Arsenal 2024/25 Home Shirt');
    expect(topMatch.clubName).toBe('Arsenal FC');
    expect(topMatch.league).toBe('Premier League');
    expect(topMatch.basePrice).toBe(85);
    expect(topMatch.similarity).toBeGreaterThan(0.9);
    expect(topMatch.availableSizes).toMatchObject([
      { size: 'M', stockQuantity: 8 },
      { size: 'L', stockQuantity: 4 },
    ]);
  });

  it('applies league filter correctly', async () => {
    vi.spyOn(EmbeddingService, 'generateEmbedding').mockResolvedValue(mockVectorHome);

    const res = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'football jersey', league: 'La Liga' });

    expect(res.status).toBe(200);
    // All results must be from La Liga
    for (const item of res.body.data.results) {
      expect(item.league).toBe('La Liga');
    }
  });

  it('applies maxPrice filter correctly', async () => {
    vi.spyOn(EmbeddingService, 'generateEmbedding').mockResolvedValue(mockVectorHome);

    const res = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'football jersey', maxPrice: 90 });

    expect(res.status).toBe(200);
    for (const item of res.body.data.results) {
      expect(item.basePrice).toBeLessThanOrEqual(90);
    }
  });

  it('applies kitType filter correctly', async () => {
    vi.spyOn(EmbeddingService, 'generateEmbedding').mockResolvedValue(mockVectorHome);

    const res = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'football jersey', kitType: 'HOME' });

    expect(res.status).toBe(200);
    for (const item of res.body.data.results) {
      expect(item.kitType).toBe('HOME');
    }
  });

  it('respects limit parameter', async () => {
    vi.spyOn(EmbeddingService, 'generateEmbedding').mockResolvedValue(mockVectorHome);

    const res = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'football jersey', limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.results.length).toBeLessThanOrEqual(1);
  });
});
