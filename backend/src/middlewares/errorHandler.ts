import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const apiError = error as ApiError;

  logger.error({
    statusCode: apiError.statusCode,
    message: apiError.message,
    errors: apiError.errors,
    stack: config.nodeEnv === 'development' ? apiError.stack : undefined,
  }, `[ERROR] ${apiError.message}`);

  res.status(apiError.statusCode).json({
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.message,
    errors: apiError.errors,
    data: null,
    ...(config.nodeEnv === 'development' ? { stack: apiError.stack } : {}),
  });
};
