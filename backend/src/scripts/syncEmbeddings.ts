/// <reference types="node" />
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../config/prisma.js';
import { EmbeddingService } from '../services/embeddingService.js';
import logger from '../utils/logger.js';

async function syncAllJerseyEmbeddings() {
  console.log('🚀 Starting semantic embedding generation for catalog jerseys...');

  const jerseys = await prisma.jersey.findMany({
    include: {
      club: true,
      embedding: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📋 Found ${jerseys.length} jerseys in the database.`);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < jerseys.length; i++) {
    const jersey = jerseys[i];
    const itemNum = `[${i + 1}/${jerseys.length}]`;

    // Construct the semantic rich text
    const semanticText = EmbeddingService.buildJerseyEmbeddingText({
      title: jersey.title,
      description: jersey.description,
      clubName: jersey.club.name,
      league: jersey.club.league,
      kitType: jersey.kitType,
      season: jersey.season,
      era: jersey.era,
    });

    console.log(`${itemNum} Generating embedding for: ${jersey.title}...`);

    try {
      // 1. Generate 768-dimension vector from Gemini API
      const vector = await EmbeddingService.generateEmbedding(semanticText);

      // 2. Upsert into PostgreSQL pgvector table
      await EmbeddingService.upsertJerseyEmbedding(jersey.id, semanticText, vector);

      successCount++;
      console.log(`   ✅ Saved 768-dim vector to pgvector (id: ${jersey.id})`);

      // Gentle rate limit protection (150ms between API calls)
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (error) {
      console.error(`   ❌ Failed to generate embedding for ${jersey.title}:`, error);
    }
  }

  const totalEmbeddings = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "jersey_embeddings"
  `;

  console.log('\n🎉 Embedding Sync Complete!');
  console.log(`   - Total jerseys processed: ${jerseys.length}`);
  console.log(`   - Successfully embedded: ${successCount}`);
  console.log(`   - Total rows in jersey_embeddings: ${Number(totalEmbeddings[0].count)}`);
}

syncAllJerseyEmbeddings()
  .catch((err) => {
    logger.error({ err }, 'Fatal error during embedding sync');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
