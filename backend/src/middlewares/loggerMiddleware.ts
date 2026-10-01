import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pinoHttpModule from 'pino-http';
import logger from '../utils/logger.js';

// Resolve pino-http function correctly across CJS/ESM
type PinoHttpFunction = (opts?: pinoHttpModule.Options) => pinoHttpModule.HttpLogger;
const pinoHttp = pinoHttpModule as unknown as PinoHttpFunction;

// Middleware to capture response body for structured logging
export const responseBodyCapture: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  res.send = function (body: unknown) {
    try {
      res.locals.responseBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch {
      res.locals.responseBody = body;
    }
    return originalSend.apply(this, [body]);
  };
  next();
};

export const loggerMiddleware = pinoHttp({
  logger,
  serializers: {
    req: (req: IncomingMessage) => ({
      id: (req as IncomingMessage & { id?: string | number }).id,
      method: req.method,
      url: req.url,
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
      body: (res as ServerResponse & { raw?: { locals?: { responseBody?: unknown } } }).raw?.locals?.responseBody,
    }),
  },
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if ((res.statusCode && res.statusCode >= 500) || err) return 'error';
    if (res.statusCode && res.statusCode >= 400) return 'warn';
    return 'info';
  },
}) as unknown as RequestHandler;
