import express from 'express';
import { responseBodyCapture, loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Core Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP Request & Response Body Interceptor for Structured Logging
app.use(responseBodyCapture);
app.use(loggerMiddleware);

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

// 404 Route Handler
app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
