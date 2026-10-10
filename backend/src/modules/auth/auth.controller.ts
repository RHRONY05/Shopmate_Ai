import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { authService } from './auth.service.js';
import { Size } from '@prisma/client';

const updatePreferencesSchema = z.object({
  favoriteClub: z.string().trim().max(100).optional(),
  defaultSize: z.nativeEnum(Size).optional(),
});

/**
 * POST /api/webhooks/clerk
 * Ingests and synchronizes Clerk user events using Svix signature verification
 */
export const handleClerkWebhook = asyncHandler(async (req: Request, res: Response) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const headers = {
    'svix-id': req.headers['svix-id'] as string | undefined,
    'svix-timestamp': req.headers['svix-timestamp'] as string | undefined,
    'svix-signature': req.headers['svix-signature'] as string | undefined,
  };

  const event = authService.verifyWebhookSignature(rawBody, headers);
  const eventId = event.id || (headers['svix-id'] as string);

  if (!eventId) {
    throw new ApiError(400, 'Unable to determine event ID from webhook payload or headers');
  }

  const result = await authService.handleWebhookEvent(event, eventId);

  res.status(200).json(
    new ApiResponse(200, result, 'Webhook event processed successfully')
  );
});

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile and preferences
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized: No active user session');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: req.user.id,
        clerkId: req.user.clerkId,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        favoriteClub: req.user.favoriteClub,
        defaultSize: req.user.defaultSize,
        createdAt: req.user.createdAt,
      },
      'Current authenticated user retrieved successfully'
    )
  );
});

/**
 * PATCH /api/auth/preferences
 * Updates user preferences (favorite club, default sizing)
 */
export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized: No active user session');
  }

  const validatedData = updatePreferencesSchema.parse(req.body);
  const updatedUser = await authService.updateUserPreferences(req.user.id, validatedData);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: updatedUser.id,
        favoriteClub: updatedUser.favoriteClub,
        defaultSize: updatedUser.defaultSize,
      },
      'User preferences updated successfully'
    )
  );
});
