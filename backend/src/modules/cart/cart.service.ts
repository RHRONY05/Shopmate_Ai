import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AddItemToCartInput } from './cart.schemas.js';

export const CUSTOM_PRINTING_PRICE = 15.00;
export const SLEEVE_BADGE_PRICE = 5.00;

export const cartIncludeQuery = {
  items: {
    include: {
      jerseyVariant: {
        include: {
          jersey: {
            select: {
              id: true,
              title: true,
              slug: true,
              kitType: true,
              season: true,
              basePrice: true,
              images: true,
              club: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartIncludeQuery;
}>;

export class CartService {
  /**
   * Resolves an existing active cart or initializes a new active cart
   * Supporting both authenticated users and anonymous guest sessions
   */
  async getOrCreateCart(sessionId?: string, userId?: string): Promise<CartWithItems> {
    if (userId) {
      let userCart = await prisma.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: cartIncludeQuery,
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: {
            userId,
            sessionId: sessionId || randomUUID(),
            status: 'ACTIVE',
          },
          include: cartIncludeQuery,
        });
      }

      return userCart;
    }

    if (sessionId) {
      let guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: cartIncludeQuery,
      });

      if (!guestCart || guestCart.status !== 'ACTIVE') {
        guestCart = await prisma.cart.create({
          data: {
            sessionId: sessionId || randomUUID(),
            status: 'ACTIVE',
          },
          include: cartIncludeQuery,
        });
      }

      return guestCart;
    }

    // Neither userId nor sessionId provided - initialize brand new guest session
    return prisma.cart.create({
      data: {
        sessionId: randomUUID(),
        status: 'ACTIVE',
      },
      include: cartIncludeQuery,
    });
  }

  /**
   * Adds an item to the cart with server-authoritative price calculation,
   * real-time stock verification, and custom printing addon pricing.
   */
  async addItem(
    sessionContext: { sessionId?: string; userId?: string },
    input: AddItemToCartInput
  ) {
    const { jerseyVariantId, quantity, customName, customNumber, sleeveBadge } = input;

    // 1. Fetch variant and associated jersey to verify existence and retrieve base price
    const variant = await prisma.jerseyVariant.findUnique({
      where: { id: jerseyVariantId },
      include: {
        jersey: true,
      },
    });

    if (!variant) {
      throw new ApiError(404, `Jersey variant not found with ID: '${jerseyVariantId}'`);
    }

    if (variant.stockQuantity <= 0) {
      throw new ApiError(400, `Selected size '${variant.size}' is currently out of stock`);
    }

    // 2. Resolve or create active cart
    const cart = await this.getOrCreateCart(sessionContext.sessionId, sessionContext.userId);

    // 3. Check for existing identical cart item (matching composite customization attributes)
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        jerseyVariantId,
        customName: customName ?? null,
        customNumber: customNumber ?? null,
        sleeveBadge: sleeveBadge ?? null,
      },
    });

    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    // 4. Strict inventory verification
    if (targetQuantity > variant.stockQuantity) {
      throw new ApiError(
        400,
        `Cannot add ${quantity} item(s). Requested total of ${targetQuantity} exceeds available stock of ${variant.stockQuantity}`
      );
    }

    // 5. Server-Authoritative Price Calculation
    // Custom name or number adds 15.00 USD; Sleeve badge adds 5.00 USD
    const hasCustomPrinting = Boolean(customName || (customNumber !== null && customNumber !== undefined));
    const hasSleeveBadge = Boolean(sleeveBadge);

    const basePriceNum = Number(variant.jersey.basePrice);
    const printingAddon = hasCustomPrinting ? CUSTOM_PRINTING_PRICE : 0;
    const badgeAddon = hasSleeveBadge ? SLEEVE_BADGE_PRICE : 0;
    const finalUnitPrice = basePriceNum + printingAddon + badgeAddon;

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: targetQuantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          jerseyVariantId,
          quantity,
          customName: customName ?? null,
          customNumber: customNumber ?? null,
          sleeveBadge: sleeveBadge ?? null,
          unitPrice: new Prisma.Decimal(finalUnitPrice),
        },
      });
    }

    // 6. Return refreshed cart
    const refreshedCart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartIncludeQuery,
    });

    return this.formatCart(refreshedCart);
  }

  /**
   * Updates line item quantity with real-time stock verification
   */
  async updateItemQuantity(
    sessionContext: { sessionId?: string; userId?: string },
    itemId: string,
    quantity: number
  ) {
    const cart = await this.getOrCreateCart(sessionContext.sessionId, sessionContext.userId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { jerseyVariant: true },
    });

    if (!item) {
      throw new ApiError(404, `Cart item not found with ID: '${itemId}' in current cart`);
    }

    if (quantity > item.jerseyVariant.stockQuantity) {
      throw new ApiError(
        400,
        `Requested quantity of ${quantity} exceeds available stock of ${item.jerseyVariant.stockQuantity}`
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const refreshedCart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartIncludeQuery,
    });

    return this.formatCart(refreshedCart);
  }

  /**
   * Removes an item from the cart
   */
  async removeItem(sessionContext: { sessionId?: string; userId?: string }, itemId: string) {
    const cart = await this.getOrCreateCart(sessionContext.sessionId, sessionContext.userId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new ApiError(404, `Cart item not found with ID: '${itemId}' in current cart`);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const refreshedCart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartIncludeQuery,
    });

    return this.formatCart(refreshedCart);
  }

  /**
   * Empties all items from the active cart
   */
  async clearCart(sessionContext: { sessionId?: string; userId?: string }) {
    const cart = await this.getOrCreateCart(sessionContext.sessionId, sessionContext.userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const refreshedCart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: cartIncludeQuery,
    });

    return this.formatCart(refreshedCart);
  }

  /**
   * Formats cart and calculates totals with server-authoritative numbers
   */
  formatCart(cart: CartWithItems) {
    let totalItems = 0;
    let subtotalAmount = 0;

    const items = cart.items.map((item) => {
      const itemUnitPrice = Number(item.unitPrice);
      const itemTotalPrice = Number((itemUnitPrice * item.quantity).toFixed(2));
      totalItems += item.quantity;
      subtotalAmount += itemTotalPrice;

      return {
        id: item.id,
        cartId: item.cartId,
        jerseyVariantId: item.jerseyVariantId,
        quantity: item.quantity,
        customName: item.customName,
        customNumber: item.customNumber,
        sleeveBadge: item.sleeveBadge,
        unitPrice: itemUnitPrice,
        totalPrice: itemTotalPrice,
        variant: {
          id: item.jerseyVariant.id,
          size: item.jerseyVariant.size,
          sku: item.jerseyVariant.sku,
          stockQuantity: item.jerseyVariant.stockQuantity,
        },
        jersey: {
          id: item.jerseyVariant.jersey.id,
          title: item.jerseyVariant.jersey.title,
          slug: item.jerseyVariant.jersey.slug,
          kitType: item.jerseyVariant.jersey.kitType,
          season: item.jerseyVariant.jersey.season,
          basePrice: Number(item.jerseyVariant.jersey.basePrice),
          images: item.jerseyVariant.jersey.images,
          club: item.jerseyVariant.jersey.club,
        },
      };
    });

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      status: cart.status,
      totalItems,
      subtotalAmount: Number(subtotalAmount.toFixed(2)),
      currency: 'USD',
      items,
    };
  }
}

export const cartService = new CartService();
