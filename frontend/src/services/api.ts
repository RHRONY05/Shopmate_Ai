import type { Club, Jersey, CartModel, OrderModel } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getSessionId(): string {
  let sessionId = localStorage.getItem('shopmate_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('shopmate_session_id', sessionId);
  }
  return sessionId;
}

export function getAuthHeaders(userToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  return headers;
}

// ---- Catalog API -----------------------------------------------------------

export async function fetchClubs(): Promise<Club[]> {
  const res = await fetch(`${API_BASE_URL}/api/clubs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch clubs');
  const data = await res.json();
  return data.data || [];
}

export interface GetJerseysParams {
  league?: string;
  clubSlug?: string;
  kitType?: string;
  era?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export async function fetchJerseys(params: GetJerseysParams = {}): Promise<{
  jerseys: Jersey[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      if (key === 'sortBy') {
        if (val === 'newest') {
          query.set('sortBy', 'createdAt');
          query.set('sortOrder', 'desc');
        } else if (val === 'price_asc') {
          query.set('sortBy', 'price');
          query.set('sortOrder', 'asc');
        } else if (val === 'price_desc') {
          query.set('sortBy', 'price');
          query.set('sortOrder', 'desc');
        } else if (val === 'rating') {
          query.set('sortBy', 'rating');
          query.set('sortOrder', 'desc');
        } else {
          query.set('sortBy', String(val));
        }
      } else {
        query.set(key, String(val));
      }
    }
  });

  const res = await fetch(`${API_BASE_URL}/api/jerseys?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch jerseys');
  const data = await res.json();
  const rawData = data.data || {};
  return {
    jerseys: rawData.items || rawData.jerseys || [],
    pagination: rawData.pagination,
  };
}

export async function fetchJerseyBySlug(slug: string): Promise<Jersey> {
  const res = await fetch(`${API_BASE_URL}/api/jerseys/${encodeURIComponent(slug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch jersey '${slug}'`);
  const data = await res.json();
  return data.data;
}

export async function semanticSearch(query: string, limit = 6): Promise<Jersey[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/search/semantic?q=${encodeURIComponent(query)}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error('Semantic search failed');
  const data = await res.json();
  return data.data?.results || [];
}

// ---- Cart API --------------------------------------------------------------

export function normalizeCart(raw: any): CartModel {
  if (!raw) {
    return {
      id: '',
      status: 'ACTIVE',
      items: [],
      subtotal: 0,
      customizationTotal: 0,
      estimatedTax: 0,
      shipping: 0,
      grandTotal: 0,
      itemCount: 0,
    };
  }

  const items = (raw.items || []).map((it: any) => ({
    id: it.id,
    cartId: it.cartId,
    jerseyVariantId: it.jerseyVariantId,
    quantity: it.quantity,
    customName: it.customName,
    customNumber: it.customNumber,
    sleeveBadge: it.sleeveBadge,
    unitPrice: Number(it.unitPrice || 0),
    totalPrice: Number(it.totalPrice || 0),
    jerseyVariant: it.jerseyVariant || {
      id: it.variant?.id || it.jerseyVariantId,
      size: it.variant?.size || 'M',
      stockQuantity: it.variant?.stockQuantity || 10,
      sku: it.variant?.sku || '',
      jersey: it.jersey || {
        id: '',
        title: 'Authentic Kit',
        slug: '',
        kitType: 'HOME',
        season: '2024/25',
        basePrice: it.unitPrice || 89.99,
        images: [],
      },
    },
  }));

  const totalItems =
    raw.totalItems !== undefined
      ? raw.totalItems
      : items.reduce((acc: number, i: any) => acc + i.quantity, 0);

  const subtotal =
    raw.subtotalAmount !== undefined
      ? raw.subtotalAmount
      : raw.subtotal !== undefined
      ? raw.subtotal
      : 0;

  let custTotal = 0;
  for (const it of items) {
    if (it.customName || (it.customNumber !== null && it.customNumber !== undefined)) {
      custTotal += 15.0 * it.quantity;
    }
    if (it.sleeveBadge) {
      custTotal += 5.0 * it.quantity;
    }
  }

  return {
    id: raw.id,
    sessionId: raw.sessionId,
    userId: raw.userId,
    status: raw.status || 'ACTIVE',
    items,
    subtotal: Number(subtotal),
    customizationTotal: custTotal,
    estimatedTax: 0,
    shipping: 0,
    grandTotal: Number(subtotal),
    itemCount: totalItems,
  };
}

export async function fetchCart(token?: string | null): Promise<CartModel> {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  const serverSession = res.headers.get('x-session-id');
  if (serverSession && serverSession !== getSessionId()) {
    localStorage.setItem('shopmate_session_id', serverSession);
  }
  const data = await res.json();
  return normalizeCart(data.data);
}

export interface AddToCartPayload {
  jerseyVariantId: string;
  quantity?: number;
  customName?: string | null;
  customNumber?: number | null;
  sleeveBadge?: string | null;
}

export async function addToCartApi(
  payload: AddToCartPayload,
  token?: string | null
): Promise<CartModel> {
  const res = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add item to bag');
  }
  const data = await res.json();
  return normalizeCart(data.data);
}

export async function updateCartItemQuantityApi(
  itemId: string,
  quantity: number,
  token?: string | null
): Promise<CartModel> {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart item');
  const data = await res.json();
  return normalizeCart(data.data);
}

export async function removeCartItemApi(
  itemId: string,
  token?: string | null
): Promise<CartModel> {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  const data = await res.json();
  return normalizeCart(data.data);
}

// ---- Payments & Orders API -------------------------------------------------

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  amountInCents: number;
  currency: string;
  cartId: string;
}

export async function createPaymentIntentApi(
  cartId?: string,
  guestEmail?: string,
  token?: string | null
): Promise<CreatePaymentIntentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ cartId, guestEmail }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to initialize payment');
  }
  const data = await res.json();
  return data.data;
}

export async function confirmClientPaymentApi(
  paymentIntentId: string,
  token?: string | null
): Promise<OrderModel> {
  const res = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ paymentIntentId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to confirm payment');
  }
  const data = await res.json();
  return data.data;
}

export async function fetchOrderApi(orderId: string, token?: string | null): Promise<OrderModel> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error(`Order '${orderId}' not found`);
  const data = await res.json();
  return data.data;
}

export async function fetchUserOrdersApi(guestEmail?: string, token?: string | null): Promise<OrderModel[]> {
  const query = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/orders${query}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch user orders');
  const data = await res.json();
  return data.data || [];
}

// ---- SSE Streaming AI Chat API ---------------------------------------------

export interface StreamChatCallbacks {
  onChunk: (chunk: string) => void;
  onToolCall?: (tool: { name: string; args?: Record<string, unknown> }) => void;
  onToolResult?: (tool: { name: string; result?: unknown }) => void;
  onError?: (error: string) => void;
  onComplete?: (fullText: string) => void;
}

export async function streamAIChat(
  message: string,
  callbacks: StreamChatCallbacks,
  token?: string | null
): Promise<void> {
  const sessionId = getSessionId();
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      message,
      sessionId,
      guestSessionId: sessionId,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error('Failed to connect to AI streaming endpoint');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullAccumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim() || line.startsWith(':')) continue;

      const eventMatch = line.match(/^event: (.*)$/m);
      const dataMatch = line.match(/^data: (.*)$/m);

      const eventType = eventMatch ? eventMatch[1] : 'message';
      if (!dataMatch) continue;

      try {
        const payload = JSON.parse(dataMatch[1]);
        if (eventType === 'message' && payload.text) {
          fullAccumulated += payload.text;
          callbacks.onChunk(payload.text);
        } else if (eventType === 'tool_call') {
          callbacks.onToolCall?.(payload);
        } else if (eventType === 'tool_result') {
          callbacks.onToolResult?.(payload);
        } else if (eventType === 'done') {
          callbacks.onComplete?.(payload.completeText || fullAccumulated);
        } else if (eventType === 'error') {
          callbacks.onError?.(payload.error || 'AI generation encountered an issue');
        }
      } catch {
        // Fallback for non-JSON lines
      }
    }
  }

  callbacks.onComplete?.(fullAccumulated);
}
