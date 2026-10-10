import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import {
  handleClerkWebhook,
  getCurrentUser,
  updatePreferences,
} from './auth.controller.js';

const router = Router();

// Public Webhook Ingestion Endpoint
router.post('/webhooks/clerk', handleClerkWebhook);

// Protected User Profile Endpoints
router.get('/auth/me', requireAuth, getCurrentUser);
router.patch('/auth/preferences', requireAuth, updatePreferences);

export default router;
