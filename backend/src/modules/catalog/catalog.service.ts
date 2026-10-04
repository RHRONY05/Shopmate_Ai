import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import type { GetJerseysQuery } from './catalog.schemas.js';

export class CatalogService {
  /**
   * Retrieves all football clubs ordered alphabetically with active jersey count
   */
  async getClubs() {
    return prisma.club.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { jerseys: true },
        },
      },
    });
  }

  /**
   * Retrieves paginated jerseys matching faceted filter criteria
   */
  async getJerseys(query: GetJerseysQuery) {
    const {
      clubId,
      league,
      kitType,
      era,
      minPrice,
      maxPrice,
      isFeatured,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const where: Prisma.JerseyWhereInput = {};

    if (clubId) {
      where.clubId = clubId;
    }

    if (league) {
      where.club = { league };
    }

    if (kitType) {
      where.kitType = kitType;
    }

    if (era) {
      where.era = era;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { club: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Determine sorting criteria
    let orderBy: Prisma.JerseyOrderByWithRelationInput;
    if (sortBy === 'price') {
      orderBy = { basePrice: sortOrder };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [totalItems, items] = await Promise.all([
      prisma.jersey.count({ where }),
      prisma.jersey.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              slug: true,
              league: true,
              logoUrl: true,
            },
          },
          variants: {
            select: {
              id: true,
              size: true,
              stockQuantity: true,
              sku: true,
            },
            orderBy: { size: 'asc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves single jersey by unique slug with club and all size variants
   */
  async getJerseyBySlug(slug: string) {
    return prisma.jersey.findUnique({
      where: { slug },
      include: {
        club: true,
        variants: {
          orderBy: { size: 'asc' },
        },
      },
    });
  }
}

export const catalogService = new CatalogService();
