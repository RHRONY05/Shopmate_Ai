import { FunctionDeclaration, Type } from '@google/genai';
import { prisma } from '../../config/prisma.js';
import { EmbeddingService } from '../../services/embeddingService.js';
import { cartService } from '../cart/cart.service.js';
import {
  searchJerseysToolSchema,
  addToCartToolSchema,
  recommendSizeToolSchema,
} from './ai.schemas.js';
import { Size } from '@prisma/client';

export interface ToolExecutionContext {
  userId?: string;
  guestSessionId?: string;
}

// 1. Gemini Function Declarations
export const geminiToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'search_jerseys',
    description:
      'Search the football jersey catalog using natural language semantic description, colors, clubs, or styles, with optional league or budget filters.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            'Semantic query describing the desired jersey, club, era, kit type, or colors (e.g., "vintage 90s red shirt", "black and gold away")',
        },
        league: {
          type: Type.STRING,
          description: 'Filter by football league (e.g., "Premier League", "La Liga", "Serie A")',
        },
        kitType: {
          type: Type.STRING,
          description: 'Kit variation: "HOME", "AWAY", "THIRD", "FOURTH", or "GOALKEEPER"',
        },
        maxPrice: {
          type: Type.NUMBER,
          description: 'Maximum jersey base price in USD',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'add_to_cart',
    description:
      'Add an authentic football jersey to the customer shopping cart with specified size, optional official badge, and custom player name/number printing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        jerseyId: {
          type: Type.STRING,
          description: 'Unique UUID of the jersey to add to cart',
        },
        size: {
          type: Type.STRING,
          description: 'Jersey size: "S", "M", "L", "XL", or "XXL"',
        },
        quantity: {
          type: Type.NUMBER,
          description: 'Quantity to add (defaults to 1)',
        },
        customName: {
          type: Type.STRING,
          description: 'Optional player name printed on back (e.g., "SAKA", "BELLINGHAM")',
        },
        customNumber: {
          type: Type.NUMBER,
          description: 'Optional player squad number printed on back (0 to 99)',
        },
        hasBadge: {
          type: Type.BOOLEAN,
          description: 'Whether to attach official competition tournament sleeve badge (+5 USD)',
        },
      },
      required: ['jerseyId', 'size'],
    },
  },
  {
    name: 'get_cart_summary',
    description:
      'Retrieve the customer current shopping cart, including all items, selected sizes, custom printing, badges, itemized costs, and total amount in USD.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'recommend_size',
    description:
      'Recommend the ideal football jersey size based on the customer height, weight, and preferred fit styling.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        heightCm: {
          type: Type.NUMBER,
          description: 'Customer height in centimeters (e.g., 178)',
        },
        weightKg: {
          type: Type.NUMBER,
          description: 'Customer weight in kilograms (e.g., 74)',
        },
        fitPreference: {
          type: Type.STRING,
          description:
            'Preferred fit styling: "slim" (athletic matchday fit), "regular" (standard comfortable fit), or "relaxed" (streetwear / layered over hoodie)',
        },
      },
      required: ['heightCm', 'weightKg'],
    },
  },
];

// 2. Concrete Tool Executors

/**
 * Executes semantic search using pgvector
 */
export async function executeSearchJerseys(rawArgs: Record<string, unknown>) {
  const args = searchJerseysToolSchema.parse(rawArgs);

  const results = await EmbeddingService.findSimilarJerseys(args.query, {
    league: args.league,
    kitType: args.kitType,
    maxPrice: args.maxPrice,
    limit: 5,
  });

  return {
    query: args.query,
    count: results.length,
    jerseys: results.map((j) => ({
      id: j.id,
      title: j.title,
      club: j.clubName,
      league: j.league,
      kitType: j.kitType,
      season: j.season,
      priceUsd: j.basePrice,
      images: j.images,
      similarityScore: j.similarity,
      availableSizes: j.availableSizes,
    })),
  };
}

/**
 * Adds an item to the shopping cart with live inventory verification via CartService
 */
export async function executeAddToCart(
  rawArgs: Record<string, unknown>,
  ctx: ToolExecutionContext
) {
  const args = addToCartToolSchema.parse(rawArgs);

  // 1. Fetch variant for the requested jerseyId and size
  const variant = await prisma.jerseyVariant.findFirst({
    where: {
      jerseyId: args.jerseyId,
      size: args.size,
    },
    include: {
      jersey: {
        include: { club: true },
      },
    },
  });

  if (!variant) {
    // Check available variants for this jersey to guide the user
    const otherVariants = await prisma.jerseyVariant.findMany({
      where: {
        jerseyId: args.jerseyId,
        stockQuantity: { gt: 0 },
      },
      select: { size: true, stockQuantity: true },
    });

    return {
      success: false,
      error: `Size ${args.size} is not available for this jersey.`,
      availableSizes: otherVariants.map((v) => `${v.size} (${v.stockQuantity} in stock)`),
    };
  }

  if (variant.stockQuantity < args.quantity) {
    return {
      success: false,
      error: `Requested quantity ${args.quantity} exceeds available stock of ${variant.stockQuantity} for size ${args.size}.`,
      stockRemaining: variant.stockQuantity,
    };
  }

  // 2. Delegate to CartService
  const sessionContext = {
    sessionId: ctx.guestSessionId,
    userId: ctx.userId,
  };

  try {
    const formattedCart = await cartService.addItem(sessionContext, {
      jerseyVariantId: variant.id,
      quantity: args.quantity,
      customName: args.customName ?? null,
      customNumber: args.customNumber ?? null,
      sleeveBadge: args.hasBadge ? 'Official Tournament Badge' : null,
    });

    return {
      success: true,
      message: `Added ${args.quantity}x ${variant.jersey.title} (Size ${args.size}) to cart.`,
      cartSummary: {
        totalItems: formattedCart.totalItems,
        totalAmountUsd: formattedCart.subtotalAmount,
        currency: 'USD',
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Returns complete itemized cart summary via CartService
 */
export async function executeGetCartSummary(ctx: ToolExecutionContext) {
  const cart = await cartService.getOrCreateCart(ctx.guestSessionId, ctx.userId);
  const formatted = cartService.formatCart(cart);

  return {
    cartId: formatted.id,
    totalItems: formatted.totalItems,
    subtotalUsd: formatted.subtotalAmount,
    currency: 'USD',
    items: formatted.items.map((item) => ({
      itemId: item.id,
      jerseyTitle: item.jersey.title,
      clubName: item.jersey.club.name,
      size: item.variant.size,
      quantity: item.quantity,
      unitPriceUsd: item.unitPrice,
      totalPriceUsd: item.totalPrice,
      customName: item.customName,
      customNumber: item.customNumber,
      sleeveBadge: item.sleeveBadge,
    })),
  };
}

/**
 * Recommends size based on height, weight, and preferred fit
 */
export async function executeRecommendSize(rawArgs: Record<string, unknown>) {
  const args = recommendSizeToolSchema.parse(rawArgs);

  const heightM = args.heightCm / 100;
  const bmi = args.weightKg / (heightM * heightM);

  let baseSize: Size;

  if (args.heightCm < 168) {
    baseSize = bmi > 25 ? Size.M : Size.S;
  } else if (args.heightCm <= 178) {
    if (bmi < 22) baseSize = Size.S;
    else if (bmi <= 26) baseSize = Size.M;
    else baseSize = Size.L;
  } else if (args.heightCm <= 188) {
    if (bmi < 23) baseSize = Size.M;
    else if (bmi <= 27) baseSize = Size.L;
    else baseSize = Size.XL;
  } else {
    if (bmi < 25) baseSize = Size.L;
    else if (bmi <= 29) baseSize = Size.XL;
    else baseSize = Size.XXL;
  }

  // Adjust for fit preference
  let recommendedSize = baseSize;
  const sizeOrder: Size[] = [Size.S, Size.M, Size.L, Size.XL, Size.XXL];
  const currentIndex = sizeOrder.indexOf(baseSize);

  if (args.fitPreference === 'slim' && currentIndex > 0) {
    recommendedSize = sizeOrder[currentIndex - 1];
  } else if (args.fitPreference === 'relaxed' && currentIndex < sizeOrder.length - 1) {
    recommendedSize = sizeOrder[currentIndex + 1];
  }

  return {
    recommendedSize,
    heightCm: args.heightCm,
    weightKg: args.weightKg,
    fitPreference: args.fitPreference,
    advice: `Based on a height of ${args.heightCm} cm and weight of ${args.weightKg} kg with a ${args.fitPreference} fit, size ${recommendedSize} is recommended for authentic match jerseys.`,
  };
}

/**
 * Central tool dispatcher
 */
export async function dispatchToolCall(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<Record<string, unknown>> {
  switch (name) {
    case 'search_jerseys':
      return await executeSearchJerseys(args);
    case 'add_to_cart':
      return await executeAddToCart(args, ctx);
    case 'get_cart_summary':
      return await executeGetCartSummary(ctx);
    case 'recommend_size':
      return await executeRecommendSize(args);
    default:
      throw new Error(`Unrecognized AI tool function name: ${name}`);
  }
}
