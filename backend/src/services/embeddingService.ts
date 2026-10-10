import { GoogleGenAI } from '@google/genai';
import { prisma } from '../config/prisma.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import { KitType } from '@prisma/client';

// Initialize the Google Gen AI client with the verified modern SDK
const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY || '',
});

export interface SemanticSearchOptions {
  limit?: number;
  league?: string;
  kitType?: KitType;
  maxPrice?: number;
  minSimilarity?: number;
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  kitType: string;
  season: string;
  era: string;
  clubName: string;
  league: string;
  similarity: number;
  availableSizes: Array<{ size: string; stockQuantity: number }>;
}

export class EmbeddingService {
  private static readonly MODEL_NAME = 'gemini-embedding-001';

  /**
   * Generates a 768-dimension dense vector from input text using Gemini gemini-embedding-001.
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error('[EmbeddingService] Cannot generate embedding for empty text.');
    }

    try {
      const response = await ai.models.embedContent({
        model: this.MODEL_NAME,
        contents: text,
        config: {
          outputDimensionality: 768,
        },
      });

      const values = response.embeddings?.[0]?.values;
      if (!values || values.length === 0) {
        throw new Error('[EmbeddingService] Received empty embedding values from Gemini API.');
      }

      return values;
    } catch (error) {
      logger.error({ error, textSnippet: text.slice(0, 60) }, '[EmbeddingService] Failed to generate embedding');
      throw error;
    }
  }

  /**
   * Formats a rich semantic text representation of a jersey for embedding.
   */
  public static buildJerseyEmbeddingText(jersey: {
    title: string;
    description: string;
    clubName: string;
    league: string;
    kitType: string;
    season: string;
    era: string;
  }): string {
    return [
      `Club: ${jersey.clubName} (${jersey.league})`,
      `Jersey: ${jersey.title}`,
      `Season: ${jersey.season}`,
      `Type: ${jersey.kitType} Kit`,
      `Era: ${jersey.era}`,
      `Styling & Features: ${jersey.description}`,
    ].join(' | ');
  }

  /**
   * Upserts a 768-dimension vector into the jersey_embeddings table using pgvector raw SQL.
   */
  public static async upsertJerseyEmbedding(
    jerseyId: string,
    contentText: string,
    vector: number[]
  ): Promise<void> {
    if (vector.length !== 768) {
      throw new Error(`[EmbeddingService] Vector dimension mismatch: expected 768, got ${vector.length}`);
    }

    const vectorString = `[${vector.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO "jersey_embeddings" ("id", "jerseyId", "embedding", "contentText", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${jerseyId},
        ${vectorString}::vector,
        ${contentText},
        NOW(),
        NOW()
      )
      ON CONFLICT ("jerseyId") DO UPDATE
      SET "embedding" = ${vectorString}::vector,
          "contentText" = ${contentText},
          "updatedAt" = NOW();
    `;
  }

  /**
   * Semantic search: Embeds the user query, then executes a parameterized cosine distance (<=>)
   * query in PostgreSQL with optional faceted filters and available size loading.
   */
  public static async findSimilarJerseys(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    const { limit = 5, league, kitType, maxPrice, minSimilarity = 0.3 } = options;
    const queryVector = await this.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    const leagueParam = league || null;
    const kitTypeParam = kitType || null;
    const maxPriceParam = maxPrice !== undefined ? maxPrice : null;

    // Cosine Similarity = 1 - Cosine Distance (<=>)
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string;
        basePrice: string | number;
        images: string[];
        kitType: string;
        season: string;
        era: string;
        clubName: string;
        league: string;
        similarity: number;
      }>
    >`
      SELECT 
        j."id",
        j."title",
        j."slug",
        j."description",
        j."basePrice",
        j."images",
        j."kitType",
        j."season",
        j."era",
        c."name" AS "clubName",
        c."league" AS "league",
        (1 - (je."embedding" <=> ${vectorString}::vector)) AS "similarity"
      FROM "jersey_embeddings" je
      JOIN "jerseys" j ON j."id" = je."jerseyId"
      JOIN "clubs" c ON c."id" = j."clubId"
      WHERE (1 - (je."embedding" <=> ${vectorString}::vector)) >= ${minSimilarity}
        AND (${leagueParam}::text IS NULL OR c."league" = ${leagueParam})
        AND (${kitTypeParam}::"KitType" IS NULL OR j."kitType" = ${kitTypeParam}::"KitType")
        AND (${maxPriceParam}::numeric IS NULL OR j."basePrice" <= ${maxPriceParam}::numeric)
      ORDER BY je."embedding" <=> ${vectorString}::vector ASC
      LIMIT ${limit};
    `;

    if (results.length === 0) {
      return [];
    }

    // Attach in-stock sizes for shopping agent decision making
    const jerseyIds = results.map((r) => r.id);
    const variants = await prisma.jerseyVariant.findMany({
      where: {
        jerseyId: { in: jerseyIds },
        stockQuantity: { gt: 0 },
      },
      select: {
        jerseyId: true,
        size: true,
        stockQuantity: true,
      },
      orderBy: { size: 'asc' },
    });

    const variantsMap = new Map<string, Array<{ size: string; stockQuantity: number }>>();
    for (const v of variants) {
      const list = variantsMap.get(v.jerseyId) || [];
      list.push({ size: v.size, stockQuantity: v.stockQuantity });
      variantsMap.set(v.jerseyId, list);
    }

    return results.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      basePrice: Number(r.basePrice),
      images: r.images,
      kitType: r.kitType,
      season: r.season,
      era: r.era,
      clubName: r.clubName,
      league: r.league,
      similarity: Number(Number(r.similarity).toFixed(4)),
      availableSizes: variantsMap.get(r.id) || [],
    }));
  }
}
