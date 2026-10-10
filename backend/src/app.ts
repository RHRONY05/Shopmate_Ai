import express from 'express';
import { responseBodyCapture, loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { ApiError } from './utils/ApiError.js';
import { clerkMiddleware } from '@clerk/express';
import { config } from './config/env.js';
import catalogRouter from './modules/catalog/catalog.routes.js';
import cartRouter from './modules/cart/cart.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import paymentRouter from './modules/payments/payment.routes.js';
import searchRouter from './modules/search/search.routes.js';
import aiRouter from './modules/ai/ai.routes.js';

const app = express();

// Core Middlewares
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      (req as { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// HTTP Request & Response Body Interceptor for Structured Logging
app.use(responseBodyCapture);
app.use(loggerMiddleware);

// Clerk Authentication Session Middleware (Bypassed during automated unit/integration tests)
if (config.nodeEnv !== 'test') {
  if (config.clerk.publishableKey && config.clerk.secretKey) {
    app.use(
      clerkMiddleware({
        publishableKey: config.clerk.publishableKey,
        secretKey: config.clerk.secretKey,
      })
    );
  } else {
    app.use(clerkMiddleware());
  }
}

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'ShopMate AI API is healthy and operational'
    )
  );
});

// Test Endpoint for Error Handling verification
app.get('/api/test-error', () => {
  throw new ApiError(400, 'Test validation error triggered successfully', [
    'Example validation detail: missing field',
  ]);
});

// Domain Vertical Slice Routes
app.use('/api', catalogRouter);
app.use('/api', cartRouter);
app.use('/api', authRouter);
app.use('/api', paymentRouter);
app.use('/api', searchRouter);
app.use('/api', aiRouter);

// 404 Route Handler
app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
