import { Router } from 'express';
import { optionalAuth } from '../../middlewares/authMiddleware.js';
import { createPaymentIntent, handleStripeWebhook } from './payment.controller.js';

const router = Router();

// Public Webhook Ingestion Endpoint
router.post('/webhooks/stripe', handleStripeWebhook);

// Payment Intent Endpoints (with optionalAuth to capture logged-in user profile)
router.post('/payments/create-intent', optionalAuth, createPaymentIntent);

export default router;
