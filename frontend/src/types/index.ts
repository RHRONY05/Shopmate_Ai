export type KitType = 'HOME' | 'AWAY' | 'THIRD' | 'RETRO' | 'GOALKEEPER';
export type Era = 'MODERN' | 'RETRO';
export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Club {
  id: string;
  name: string;
  slug: string;
  league: string;
  country: string;
  logoUrl?: string | null;
  jerseyCount?: number;
}

export interface JerseyVariant {
  id: string;
  jerseyId: string;
  size: Size;
  stockQuantity: number;
  sku: string;
}

export interface Jersey {
  id: string;
  clubId: string;
  title: string;
  slug: string;
  description: string;
  kitType: KitType;
  season: string;
  era: Era;
  basePrice: number | string;
  isFeatured: boolean;
  images: string[];
  rating: number;
  club?: Club;
  variants?: JerseyVariant[];
  similarity?: number;
}

export interface CartCustomization {
  customName?: string | null;
  customNumber?: number | null;
  sleeveBadge?: string | null;
}

export interface CartItemModel {
  id: string;
  cartId: string;
  jerseyVariantId: string;
  quantity: number;
  customName?: string | null;
  customNumber?: number | null;
  sleeveBadge?: string | null;
  unitPrice: number;
  totalPrice: number;
  jerseyVariant: {
    id: string;
    size: Size;
    stockQuantity: number;
    jersey: {
      id: string;
      title: string;
      slug: string;
      kitType: KitType;
      season: string;
      basePrice: number | string;
      images: string[];
      club?: {
        name: string;
        logoUrl?: string | null;
      };
    };
  };
}

export interface CartModel {
  id: string;
  sessionId?: string | null;
  userId?: string | null;
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED';
  items: CartItemModel[];
  subtotal: number;
  customizationTotal: number;
  estimatedTax: number;
  shipping: number;
  grandTotal: number;
  itemCount: number;
}

export interface OrderItemModel {
  id: string;
  jerseyVariantId: string;
  quantity: number;
  customName?: string | null;
  customNumber?: number | null;
  sleeveBadge?: string | null;
  priceAtPurchase: number;
  jerseyVariant?: {
    size: Size;
    jersey?: {
      title: string;
      images: string[];
      club?: {
        name: string;
        logoUrl?: string | null;
      };
    };
  };
}

export interface OrderModel {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  totalAmount: number;
  stripePaymentIntentId?: string | null;
  shippingAddress?: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt: string;
  items: OrderItemModel[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tools?: Array<{
    name: string;
    args?: Record<string, unknown>;
    result?: unknown;
  }>;
  suggestedJerseys?: Jersey[];
}
