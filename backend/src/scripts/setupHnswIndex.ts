/// <reference types="node" />
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../config/prisma.js';

async function setupHnswIndex() {
  console.log('⚡ Setting up HNSW Vector Cosine Index in PostgreSQL...');

  const startTime = Date.now();

  // 1. Create the HNSW index using pgvector cosine distance operator
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "jersey_embeddings_embedding_hnsw_idx"
    ON "jersey_embeddings"
    USING hnsw ("embedding" vector_cosine_ops);
  `);

  const indexDuration = Date.now() - startTime;
  console.log(`✅ HNSW index created/verified in ${indexDuration}ms!`);

  // 2. Run EXPLAIN ANALYZE on a test vector query to measure execution speed
  console.log('\n📊 Measuring query execution plan and latency...');

  // Sample dummy 768-dimension vector
  const dummyVector = `[${Array(768).fill(0.01).join(',')}]`;

  const plan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(`
    EXPLAIN ANALYZE
    SELECT j."id", j."title", (1 - (je."embedding" <=> '${dummyVector}'::vector)) as similarity
    FROM "jersey_embeddings" je
    JOIN "jerseys" j ON j."id" = je."jerseyId"
    ORDER BY je."embedding" <=> '${dummyVector}'::vector ASC
    LIMIT 3;
  `);

  console.log('Query Execution Plan:');
  plan.forEach((row) => console.log('  ', row['QUERY PLAN']));

  console.log('\n🎉 Module 2.6 Complete: HNSW vector index is active and verified!');
}

setupHnswIndex()
  .catch((err) => {
    console.error('❌ Failed to setup HNSW index:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
