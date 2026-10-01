import app from './app.js';
import { config } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';
import { checkRedisConnection } from './config/redis.js';
import logger from './utils/logger.js';

const startServer = async (): Promise<void> => {
  try {
    logger.info('[STARTUP] Verifying infrastructure connections before starting HTTP server...');

    // 1. Fail-Fast Check: PostgreSQL Database
    await checkDatabaseConnection();

    // 2. Fail-Fast Check: Redis In-Memory Cache
    await checkRedisConnection();

    // 3. Start HTTP Server only after all infrastructure is verified healthy
    app.listen(config.port, () => {
      logger.info(`[SERVER] Running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`[HEALTHCHECK] http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.fatal({ err: error }, '[FATAL] Failed to connect to infrastructure. Server shutting down.');
    process.exit(1);
  }
};

startServer();
