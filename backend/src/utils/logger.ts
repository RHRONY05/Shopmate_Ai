import pino from 'pino';
import { config } from '../config/env.js';

const isTest = config.nodeEnv === 'test';
const isProduction = config.nodeEnv === 'production';

let logger: pino.Logger;

if (isTest && !process.env.LOG_LEVEL) {
  // Silent during automated tests for clean test runner output
  logger = pino({ level: 'silent' });
} else if (!isProduction) {
  // Development: Pretty colorized terminal logs
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });
} else {
  // Production: High-performance structured JSON to stdout (ready for cloud log aggregators)
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export default logger;
