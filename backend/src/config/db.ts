import pg from 'pg';
import { config } from './env.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const checkDatabaseConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('[POSTGRES] Connected to PostgreSQL database successfully');
  } finally {
    client.release();
  }
};
