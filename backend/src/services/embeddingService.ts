import { GoogleGenAI } from '@google/genai';
import { prisma } from '../config/prisma.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

// Initialize the Google Gen AI client with the verified modern SDK
const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY || '',
});

export interface SemanticSearchResult {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  images: string[];
  similarity: number;
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
   * Concatenating club, league, kit type, season, and stylistic description creates
   * an optimal semantic representation for search and discovery.
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
   * Parameterized with $executeRaw to guarantee SQL injection safety.
   */
  public static async upsertJerseyEmbedding(
    jerseyId: string,
    contentText: string,
    vector: number[]
  ): Promise<void> {
    if (vector.length !== 768) {
      throw new Error(`[EmbeddingService] Vector dimension mismatch: expected 768, got ${vector.length}`);
    }

    // Format the number[] array into PostgreSQL pgvector format: '[0.012,-0.045,...]'
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
   * Semantic search: Embeds the user query, then executes a cosine distance (<=>)
   * query in PostgreSQL to rank jerseys by semantic similarity.
   */
  public static async findSimilarJerseys(query: string, limit = 5): Promise<SemanticSearchResult[]> {
    const queryVector = await this.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // Cosine Similarity = 1 - Cosine Distance
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        slug: string;
        basePrice: string | number;
        images: string[];
        similarity: number;
      }>
    >`
      SELECT 
        j."id",
        j."title",
        j."slug",
        j."basePrice",
        j."images",
        (1 - (je."embedding" <=> ${vectorString}::vector)) AS "similarity"
      FROM "jersey_embeddings" je
      JOIN "jerseys" j ON j."id" = je."jerseyId"
      ORDER BY je."embedding" <=> ${vectorString}::vector ASC
      LIMIT ${limit};
    `;

    return results.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      basePrice: Number(r.basePrice),
      images: r.images,
      similarity: Number(r.similarity),
    }));
  }
}
