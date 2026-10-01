import { Redis } from 'ioredis';
import { config } from './env.js';
import logger from '../utils/logger.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export const checkRedisConnection = async (): Promise<void> => {
  await redis.connect();
  const pong = await redis.ping();
  if (pong === 'PONG') {
    logger.info('[REDIS] Connected to Redis cache successfully');
  } else {
    throw new Error(`Unexpected Redis ping response: ${pong}`);
  }
};
