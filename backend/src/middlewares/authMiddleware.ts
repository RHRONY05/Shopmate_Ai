import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

/**
 * Extracts the Clerk userId from either:
 * 1. Clerk's verified auth state via getAuth(req)
 * 2. In test/dev mode only: x-mock-clerk-id header for isolated testing
 */
function extractClerkId(req: Request): string | null {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      return auth.userId;
    }
  } catch {
    // getAuth throws if clerkMiddleware has not processed the request
  }

  // Allow test mocking during automated test runs
  if (config.nodeEnv === 'test') {
    const mockClerkId = (req.headers['x-mock-clerk-id'] as string)?.trim();
    if (mockClerkId) {
      return mockClerkId;
    }
  }

  return null;
}

/**
 * Middleware: Strictly requires an authenticated user.
 * Attaches the database User record to req.user.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const clerkId = extractClerkId(req);

  if (!clerkId) {
    throw new ApiError(401, 'Unauthorized: Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new ApiError(401, 'Unauthorized: User account not found in database');
  }

  req.user = user;
  next();
}

/**
 * Middleware: Optional authentication.
 * If valid auth token or mock header is present, attaches req.user without rejecting guest users.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const clerkId = extractClerkId(req);

  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (user) {
      req.user = user;
    }
  }

  next();
}

/**
 * Middleware: Requires the authenticated user to have the ADMIN role.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden: Administrator privileges required');
  }
  next();
}
