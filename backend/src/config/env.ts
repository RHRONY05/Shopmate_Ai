import dotenv from 'dotenv';

// Load backend/.env directly
dotenv.config();

interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl: string;
  redisUrl: string;
  geminiApiKey: string;
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
  };
}

const getEnvOrThrow = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`[CONFIG ERROR] Required environment variable '${key}' is missing.`);
  }
  return value;
};

export const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
  databaseUrl: getEnvOrThrow('DATABASE_URL'),
  redisUrl: getEnvOrThrow('REDIS_URL'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  },
};
