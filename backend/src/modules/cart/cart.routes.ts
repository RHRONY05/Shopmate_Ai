import { Router } from 'express';
import { optionalAuth } from '../../middlewares/authMiddleware.js';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from './cart.controller.js';

const router = Router();

// Apply optionalAuth to resolve authenticated user if Bearer token present
router.use(optionalAuth);

// Cart Operations Endpoints
router.get('/cart', getCart);
router.post('/cart/items', addItemToCart);
router.patch('/cart/items/:itemId', updateCartItemQuantity);
router.delete('/cart/items/:itemId', removeCartItem);
router.delete('/cart', clearCart);

export default router;
