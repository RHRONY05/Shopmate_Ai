import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from './env.js';
import logger from '../utils/logger.js';

// Prevent multiple instances of Prisma Client in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const checkDatabaseConnection = async (): Promise<void> => {
  await prisma.$connect();
  logger.info('[POSTGRES/PRISMA] Connected to PostgreSQL database successfully with Prisma Client');
};

export default prisma;
