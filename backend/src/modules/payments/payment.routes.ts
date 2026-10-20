import { Router } from 'express';
import { optionalAuth } from '../../middlewares/authMiddleware.js';
import {
  createPaymentIntent,
  handleStripeWebhook,
  getOrder,
  getUserOrders,
  confirmClientPayment,
} from './payment.controller.js';

const router = Router();

// Public Webhook Ingestion Endpoint (supports both /webhooks/stripe and /payments/webhook)
router.post('/webhooks/stripe', handleStripeWebhook);
router.post('/payments/webhook', handleStripeWebhook);

// Payment Intent & Confirmation Endpoints
router.post('/payments/create-intent', optionalAuth, createPaymentIntent);
router.post('/payments/confirm', optionalAuth, confirmClientPayment);

// Order Query Endpoints
router.get('/orders/:orderId', optionalAuth, getOrder);
router.get('/orders', optionalAuth, getUserOrders);

export default router;
