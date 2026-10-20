import dotenv from 'dotenv';

// Load backend/.env directly
dotenv.config();

interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl: string;
  redisUrl: string;
  geminiApiKey: string;
  geminiModel: string;
  geminiFallbackModels: string[];
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
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
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  geminiFallbackModels: process.env.GEMINI_FALLBACK_MODELS
    ? process.env.GEMINI_FALLBACK_MODELS.split(',').map((s) => s.trim()).filter(Boolean)
    : ['gemini-3.5-flash', 'gemini-3.5-flash-lite'],
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
  },
};
