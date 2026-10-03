/// <reference types="node" />
import dotenv from 'dotenv';
dotenv.config();

import { EmbeddingService } from '../services/embeddingService.js';
import { prisma } from '../config/prisma.js';

async function testSemanticSearch() {
  const testQueries = [
    'Show me all the barca jery present in the stock',
    'is there any liverpool jersy of season 2024-2025 available',
    'iconic black and white zebra stripes from Turin',
    'mint green teal away shirt with black collar',
  ];

  console.log('🧪 Testing pgvector Cosine Similarity Search...\n');

  for (const query of testQueries) {
    console.log(`🔍 Customer Query: "${query}"`);
    const results = await EmbeddingService.findSimilarJerseys(query, 2);

    results.forEach((match, index) => {
      const percentage = (match.similarity * 100).toFixed(1);
      console.log(`   #${index + 1} [${percentage}% Match] ${match.title} ($${match.basePrice.toFixed(2)})`);
    });
    console.log('');
  }
}

testSemanticSearch()
  .catch((err) => {
    console.error('❌ Search test failed:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
