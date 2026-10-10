import Stripe from 'stripe';
import { config } from './env.js';

export const stripe = new Stripe(config.stripe.secretKey, {
  typescript: true,
});
