import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { cartService } from './cart.service.js';
import {
  addItemToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from './cart.schemas.js';

function getSessionContext(req: Request) {
  const sessionId = (req.headers['x-session-id'] as string)?.trim() || undefined;
  const userId =
    req.user?.id ||
    (req.headers['x-user-id'] as string)?.trim() ||
    undefined;
  return { sessionId, userId };
}

/**
 * GET /api/cart
 * Retrieves or initializes active cart for current session or authenticated user
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, userId } = getSessionContext(req);
  const cart = await cartService.getOrCreateCart(sessionId, userId);
  const formatted = cartService.formatCart(cart);

  if (formatted.sessionId) {
    res.setHeader('x-session-id', formatted.sessionId);
  }

  res.status(200).json(
    new ApiResponse(200, formatted, 'Active shopping cart retrieved successfully')
  );
});

/**
 * POST /api/cart/items
 * Adds jersey variant to cart with real-time stock verification & server-calculated pricing
 */
export const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
  const sessionContext = getSessionContext(req);
  const validatedInput = addItemToCartSchema.parse(req.body);

  const formattedCart = await cartService.addItem(sessionContext, validatedInput);

  if (formattedCart.sessionId) {
    res.setHeader('x-session-id', formattedCart.sessionId);
  }

  res.status(201).json(
    new ApiResponse(201, formattedCart, 'Item added to cart successfully')
  );
});

/**
 * PATCH /api/cart/items/:itemId
 * Updates item quantity in the current cart
 */
export const updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
  const sessionContext = getSessionContext(req);
  const { itemId } = cartItemParamSchema.parse(req.params);
  const { quantity } = updateCartItemSchema.parse(req.body);

  const formattedCart = await cartService.updateItemQuantity(sessionContext, itemId, quantity);

  res.status(200).json(
    new ApiResponse(200, formattedCart, 'Cart item quantity updated successfully')
  );
});

/**
 * DELETE /api/cart/items/:itemId
 * Removes an item from the current cart
 */
export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const sessionContext = getSessionContext(req);
  const { itemId } = cartItemParamSchema.parse(req.params);

  const formattedCart = await cartService.removeItem(sessionContext, itemId);

  res.status(200).json(
    new ApiResponse(200, formattedCart, 'Cart item removed successfully')
  );
});

/**
 * DELETE /api/cart
 * Clears all items from the current cart
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const sessionContext = getSessionContext(req);
  const formattedCart = await cartService.clearCart(sessionContext);

  res.status(200).json(
    new ApiResponse(200, formattedCart, 'Shopping cart cleared successfully')
  );
});
