# Full-Stack Integration Plan — ShopMate AI

## 1. API Contract Alignment

| Frontend Component / Screen | Data It Needs | Backend Endpoint | Fields Returned | Gap & Resolution |
|-----------------------------|---------------|------------------|-----------------|------------------|
| **Navbar / MegaMenu** | Club list, leagues, badges | `GET /api/clubs` | `id, name, slug, league, country, logoUrl` | ✅ None. Perfect match. |
| **Home: Featured Drops** | Trending kits, images, prices, club | `GET /api/jerseys/featured` | `id, title, slug, basePrice, images, club { name, logoUrl }` | ✅ None. Redis cached. |
| **Catalog & Filter Grid** | Filtered jerseys, total count, facets | `GET /api/jerseys?league=...` | `jerseys[], pagination { total, page, pages }, facets { leagues, kitTypes, seasons, priceRange }` | ✅ None. Backend computes facets. |
| **Jersey Detail Page (PDP)** | Full specs, gallery, size stock status | `GET /api/jerseys/:slug` | `id, title, slug, description, kitType, season, era, basePrice, images, club, variants: [{ id, size, stockQuantity, sku }]` | ✅ None. Front uses variant IDs for stock checks. |
| **Custom Kit Print Preview** | Jersey image, preview coordinates | Local canvas + PDP data | Front renders SVG/canvas preview overlay using chosen `customName` & `customNumber` | ✅ Client-side derived. |
| **AI KitBot Drawer (Chat)** | Streaming text chunks, search cards, tool call statuses | `POST /api/ai/chat` (SSE) | Event stream: `data: {"type": "token", "content": "..."}`, `data: {"type": "tool_call", "name": "search_jerseys", "args": {...}}`, `data: {"type": "tool_result", "data": [...]}` | ✅ None. EventSource / Fetch reader. |
| **Mini-Cart & Cart Page** | Line items, custom print badges, subtotal | `GET /api/cart`, `POST /api/cart/items` | `id, items: [{ id, jerseyVariantId, quantity, customName, customNumber, sleeveBadge, unitPrice, jerseyVariant: { size, jersey: { title, slug, images } } }], subtotal` | ✅ None. Total computed server-side. |
| **Checkout (Stripe)** | Client secret, order ID, breakdown | `POST /api/payments/create-intent` | `clientSecret, orderId, totalAmount` | ✅ None. Stripe Elements mounts clientSecret. |
| **Order Confirmation** | Order receipt, items, tracking | `GET /api/orders/:id` | `id, orderNumber, status, totalAmount, shippingAddress, items[], createdAt` | ✅ None. Direct display. |
| **User Account & History** | Profile, preferences, past kits | `GET /api/users/me`, `GET /api/orders/mine` | `id, email, name, favoriteClub, defaultSize`, list of user orders | ✅ None. Synchronized via Clerk webhook. |

---

## 2. Cross-Cutting Concerns

### Authentication Handshake Flow (Clerk + Express)

```
Browser / React App                                   Express Backend API                      Clerk Auth Service
        │                                                     │                                       │
        ├── User clicks "Sign In" ──────────────────────────────────────────────────────────────────► │
        │   (Clerk Modal: Google / Email)                     │                                       │
        │                                                     │                                       │
        │◄── Authenticated Session (JWT token) ───────────────────────────────────────────────────────┤
        │                                                     │                                       │
        │                                                     │◄── Webhook: user.created ─────────────┤
        │                                                     │    (Syncs user into Postgres DB)      │
        │                                                     │                                       │
        ├── API Request: e.g. GET /api/orders/mine            │                                       │
        │   Header: "Authorization: Bearer <clerk_token>" ───►│                                       │
        │                                                     ├── Verify token with Clerk SDK/JWKS    │
        │                                                     ├── Find user in Postgres by clerkId    │
        │                                                     ├── Attach req.user                     │
        │◄── Response: { success: true, data: orders } ───────┤                                       │
```

*Note for Guest Users:*
- If unauthenticated, the browser generates or retrieves a UUID from `localStorage` and transmits it in the `x-session-id` header.
- The Cart and AI Chat sessions bind to `x-session-id` until the user logs in, at which point the session cart is merged into the user's permanent cart.

---

### Shared Type Contracts

Both frontend and backend adhere to identical data contracts (can be shared via a `packages/shared` or mirrored in `src/types`):

```typescript
// Shared Types for ShopMate AI

export type KitType = "HOME" | "AWAY" | "THIRD" | "RETRO" | "GOALKEEPER";
export type KitSize = "S" | "M" | "L" | "XL" | "XXL";
export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Club {
  id: string;
  name: string;
  slug: string;
  league: string;
  country: string;
  logoUrl: string;
}

export interface JerseyVariant {
  id: string;
  jerseyId: string;
  size: KitSize;
  stockQuantity: number;
  sku: string;
}

export interface Jersey {
  id: string;
  title: string;
  slug: string;
  description: string;
  kitType: KitType;
  season: string;
  era: string;
  basePrice: number;
  isFeatured: boolean;
  images: string[];
  rating: number;
  club?: Club;
  variants?: JerseyVariant[];
}

export interface CartItemPayload {
  jerseyVariantId: string;
  quantity: number;
  customName?: string;
  customNumber?: number;
  sleeveBadge?: string;
}

export interface CartLineItem extends CartItemPayload {
  id: string;
  unitPrice: number;
  jerseyVariant: JerseyVariant & { jersey: Jersey };
}

export interface CartState {
  id: string;
  sessionId?: string;
  items: CartLineItem[];
  subtotal: number;
  itemCount: number;
}
```

---

### Error Contract

All API responses strictly implement the standardized `ApiResponse` and `ApiError` envelope format:

#### Success Response Envelope (`200 / 201`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cart item added successfully",
  "data": { ... }
}
```

#### Error Response Envelope (`400 / 401 / 403 / 404 / 409 / 500`)
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Selected size XL is currently out of stock",
  "errors": [
    {
      "field": "jerseyVariantId",
      "message": "Insufficient inventory (remaining: 0)"
    }
  ]
}
```

#### Frontend Error Handling Protocol:
- **401 Unauthorized:** Prompts Clerk sign-in modal.
- **400 / 422 Validation Error:** Highlights the specific field in forms (e.g. invalid phone/address or squad number > 99).
- **409 Conflict (Inventory Race Condition):** Triggers a Toast warning and auto-refreshes the product variant stock.
- **500 Server Error:** Friendly toast notification + error boundary fallback.

---

### CORS & Environment Configuration

#### Development Environment
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:5000` (Express TypeScript dev server)
- CORS Policy: Express `cors()` configured with `origin: ["http://localhost:5173"]`, `credentials: true`.

#### Environment Variable Strategy
- **Backend (`backend/.env`):**
  - `PORT=5000`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopmate_db`
  - `REDIS_URL=redis://localhost:6379`
  - `CLERK_SECRET_KEY=sk_test_...`
  - `CLERK_PUBLISHABLE_KEY=pk_test_...`
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...`
  - `GEMINI_API_KEY=...`
  - `NODE_ENV=development`
- **Frontend (`frontend/.env`):**
  - `VITE_API_BASE_URL=http://localhost:5000`
  - `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`
  - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
