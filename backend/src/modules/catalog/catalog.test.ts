import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { KitType, Era, Size, Prisma } from '@prisma/client';

describe('Catalog Vertical Slice Integration Tests', () => {
  let testClubId: string;
  const testClubSlug = 'test-fc';
  const testJerseySlug = 'test-fc-2024-home-kit';

  beforeAll(async () => {
    // 1. Clean test data
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();

    // 2. Seed test fixtures
    const club = await prisma.club.create({
      data: {
        name: 'Test Football Club',
        slug: testClubSlug,
        league: 'Premier League',
        country: 'England',
        logoUrl: 'https://example.com/test-logo.png',
      },
    });
    testClubId = club.id;

    // 3. Create test jerseys
    const homeJersey = await prisma.jersey.create({
      data: {
        clubId: testClubId,
        title: 'Test FC 2024/25 Home Shirt',
        slug: testJerseySlug,
        description: 'Classic red home shirt with white collar.',
        kitType: KitType.HOME,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(89.99),
        isFeatured: true,
        images: ['https://example.com/home1.jpg'],
        rating: 4.8,
        variants: {
          create: [
            { size: Size.M, stockQuantity: 10, sku: 'TEST-HOME-M' },
            { size: Size.L, stockQuantity: 5, sku: 'TEST-HOME-L' },
          ],
        },
      },
    });

    await prisma.jersey.create({
      data: {
        clubId: testClubId,
        title: 'Test FC 2024/25 Away Shirt',
        slug: 'test-fc-2024-away-kit',
        description: 'Sleek black away shirt with gold accents.',
        kitType: KitType.AWAY,
        season: '2024/25',
        era: Era.MODERN,
        basePrice: new Prisma.Decimal(79.99),
        isFeatured: false,
        images: ['https://example.com/away1.jpg'],
        rating: 4.5,
        variants: {
          create: [
            { size: Size.S, stockQuantity: 3, sku: 'TEST-AWAY-S' },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.jerseyVariant.deleteMany();
    await prisma.jerseyEmbedding.deleteMany();
    await prisma.jersey.deleteMany();
    await prisma.club.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/clubs', () => {
    it('should return 200 and a list of clubs with active jersey counts', async () => {
      const response = await request(app).get('/api/clubs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const firstClub = response.body.data[0];
      expect(firstClub).toHaveProperty('name', 'Test Football Club');
      expect(firstClub).toHaveProperty('_count');
      expect(firstClub._count.jerseys).toBe(2);
    });
  });

  describe('GET /api/jerseys', () => {
    it('should return 200 with paginated jersey items', async () => {
      const response = await request(app).get('/api/jerseys?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.items.length).toBe(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });

    it('should filter jerseys by kitType (HOME)', async () => {
      const response = await request(app).get('/api/jerseys?kitType=HOME');

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].kitType).toBe('HOME');
    });

    it('should filter jerseys by price range', async () => {
      const response = await request(app).get('/api/jerseys?minPrice=85&maxPrice=100');

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBe(1);
      expect(Number(response.body.data.items[0].basePrice)).toBe(89.99);
    });

    it('should search jerseys by keyword in title or description', async () => {
      const response = await request(app).get('/api/jerseys?search=black');

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].slug).toBe('test-fc-2024-away-kit');
    });

    it('should return 400 Bad Request when an invalid kitType is passed', async () => {
      const response = await request(app).get('/api/jerseys?kitType=INVALID_TYPE');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation Error');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 Bad Request when page number is less than 1', async () => {
      const response = await request(app).get('/api/jerseys?page=0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/jerseys/:slug', () => {
    it('should return 200 with complete jersey details, club, and size variants', async () => {
      const response = await request(app).get(`/api/jerseys/${testJerseySlug}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe(testJerseySlug);
      expect(response.body.data.club.name).toBe('Test Football Club');
      expect(response.body.data.variants.length).toBe(2);
      expect(response.body.data.variants[0]).toHaveProperty('sku');
      expect(response.body.data.variants[0]).toHaveProperty('stockQuantity');
    });

    it('should return 404 Not Found for non-existent jersey slug', async () => {
      const response = await request(app).get('/api/jerseys/non-existent-jersey-slug');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Jersey not found');
    });
  });
});
