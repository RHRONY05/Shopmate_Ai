# Feature Inventory: ShopMate AI (KitRoom)

> **Scanned:** 2026-10-21 · **Commit:** `0b5e898` · **Stack:** React 19 + Vite + Redux Toolkit + Clerk + Stripe Elements (frontend) · Express 5 + TypeScript + Prisma 7 + PostgreSQL/pgvector + Redis + Pino + Zod + Gemini (`@google/genai`) (backend) · Docker Compose, Nginx, GitHub Actions
> **How to verify:** for each row, do the "How to see it" step in the app or terminal,
> open the files, and tick ✅. Correct anything wrong directly in this file.
> 👻 = no UI; use the command to see it working. Size: S / M / L.
> Backend runs on port 5000; the Vite dev server proxies `/api` to it (`npm run dev` at the root starts both).

## Summary

| Category | Features | 👻 Hidden |
|---|---|---|
| 1. Platform & Ops | 9 | 9 |
| 2. Auth & Users | 5 | 2 |
| 3. Catalog & Search | 5 | 1 |
| 4. Cart | 6 | 0 |
| 5. Checkout, Payments & Orders | 6 | 2 |
| 6. KitBot (AI agent) | 7 | 2 |
| 7. Data & Search Infrastructure | 4 | 4 |
| 8. Frontend-only | 3 | 0 |
| Testing | 1 | 0 |
| **Total** | **46** | **20** |

No cron jobs, queues or database triggers exist in this codebase (checked: no scheduler,
no worker, and the only migration creates tables, indexes and the `vector` extension).

---

## 1. Platform & Ops

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| OPS-1 | Fail-fast startup: checks Postgres + Redis before listening 👻 | Stop Redis (`docker stop shopmate_redis`), run `npm run dev:backend`, read the `[FATAL]` log; start Redis again | — | [server.ts](../backend/src/server.ts), [prisma.ts](../backend/src/config/prisma.ts), [redis.ts](../backend/src/config/redis.ts) | S | — | [ ] |
| OPS-2 | Env config with required-variable check 👻 | Rename a required var in `backend/.env`, start the backend, read the `[CONFIG ERROR]` | — | [env.ts](../backend/src/config/env.ts) | S | — | [ ] |
| OPS-3 | Health check endpoint 👻 | `curl http://localhost:5000/api/health` | — | [app.ts:47](../backend/src/app.ts#L47) | S | OPS-6 | [ ] |
| OPS-4 | Structured request/response logging (Pino) 👻 | Load any page, watch the backend terminal | — | [loggerMiddleware.ts](../backend/src/middlewares/loggerMiddleware.ts), [logger.ts](../backend/src/utils/logger.ts) | S | — | [ ] |
| OPS-5 | Central error handling: `ApiError`, `asyncHandler`, Zod → 400, 404 fallback 👻 | `curl http://localhost:5000/api/test-error` and `curl http://localhost:5000/api/nope` | — | [errorHandler.ts](../backend/src/middlewares/errorHandler.ts), [ApiError.ts](../backend/src/utils/ApiError.ts), [asyncHandler.ts](../backend/src/utils/asyncHandler.ts), [app.ts:62](../backend/src/app.ts#L62), [app.ts:77](../backend/src/app.ts#L77) | S | — | [ ] |
| OPS-6 | Standard response envelope (`ApiResponse`) 👻 | Any API response in DevTools → Response tab: `statusCode`, `data`, `message`, `success` | — | [ApiResponse.ts](../backend/src/utils/ApiResponse.ts) | S | — | [ ] |
| OPS-7 | Local infrastructure with Docker Compose (Postgres+pgvector, Redis, RedisInsight) 👻 | `docker compose up -d`, then open RedisInsight at http://localhost:5540 | — | [docker-compose.yml](../docker-compose.yml) | S | — | [ ] |
| OPS-8 | Production build: backend + frontend images, Nginx serving the SPA and proxying `/api` 👻 | Read the files; optional: `docker compose -f docker-compose.prod.yml up --build` | [Dockerfile](../frontend/Dockerfile), [nginx.conf](../frontend/nginx.conf) | [Dockerfile](../backend/Dockerfile), [docker-compose.prod.yml](../docker-compose.prod.yml) | M | OPS-7 | [ ] |
| OPS-9 | CI pipeline: install → Prisma → tests → build, on GitHub Actions 👻 | GitHub → Actions tab of the repo | — | [ci.yml](../.github/workflows/ci.yml) | S | TEST | [ ] |

## 2. Auth & Users

Sign-up and sign-in are done by **Clerk** (a hosted auth service), not by our backend.
Our backend learns about users through a webhook and checks Clerk sessions on each request.

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| AUTH-1 | Sign up / sign in / sign out (Clerk modal, user menu) | Header → Sign in button; after login, the avatar menu | [App.tsx:58](../frontend/src/App.tsx#L58) (`ClerkProvider`), [Header.tsx:223](../frontend/src/components/layout/Header.tsx#L223) | Clerk (hosted) | M | — | [ ] |
| AUTH-2 | User sync from Clerk via signed webhook (Svix) with idempotency 👻 | Sign up a new user, then check the `users` and `processed_webhook_events` tables (needs a public tunnel to receive Clerk webhooks locally) | — | [auth.routes.ts:12](../backend/src/modules/auth/auth.routes.ts#L12), [auth.controller.ts:18](../backend/src/modules/auth/auth.controller.ts#L18), [auth.service.ts:31](../backend/src/modules/auth/auth.service.ts#L31) | M | AUTH-1, OPS-5 | [ ] |
| AUTH-3 | Request authentication: `clerkMiddleware` + `requireAuth` / `optionalAuth` 👻 | Signed in vs signed out, compare `GET /api/cart` in DevTools and the backend log | — | [app.ts:33](../backend/src/app.ts#L33), [authMiddleware.ts](../backend/src/middlewares/authMiddleware.ts) | M | AUTH-1 | [ ] |
| AUTH-4 | Current user + preferences API (`GET /api/auth/me`, `PATCH /api/auth/preferences`) | Not called by the UI (see Unsure). `curl` with a session, or read the tests | — | [auth.routes.ts:15](../backend/src/modules/auth/auth.routes.ts#L15), [auth.controller.ts:44](../backend/src/modules/auth/auth.controller.ts#L44) | S | AUTH-3 | [ ] |
| AUTH-5 | Account page: profile, order history (by user or guest email), favourite club | `/account` signed in and signed out | [AccountPage.tsx](../frontend/src/pages/AccountPage.tsx) | uses PAY-5 | M | AUTH-1, PAY-5 | [ ] |

## 3. Catalog & Search

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| CAT-1 | Home page: hero, featured kits, KitBot entry points | `/` | [HomePage.tsx](../frontend/src/pages/HomePage.tsx) | uses CAT-3 | M | — | [ ] |
| CAT-2 | List clubs (for filters) | `/jerseys` → filter panel; DevTools → `GET /api/clubs` | [api.ts:27](../frontend/src/services/api.ts#L27) | [catalog.routes.ts:7](../backend/src/modules/catalog/catalog.routes.ts#L7), [catalog.service.ts:9](../backend/src/modules/catalog/catalog.service.ts#L9) | S | OPS-6 | [ ] |
| CAT-3 | Catalog page: filters (league, club, kit type, era, size), sort, pagination, keyword search, all in the URL | `/jerseys`, change filters, watch the URL and `GET /api/jerseys?...` | [CatalogPage.tsx](../frontend/src/pages/CatalogPage.tsx), [Header.tsx:35](../frontend/src/components/layout/Header.tsx#L35), [api.ts:50](../frontend/src/services/api.ts#L50) | [catalog.schemas.ts](../backend/src/modules/catalog/catalog.schemas.ts), [catalog.service.ts:23](../backend/src/modules/catalog/catalog.service.ts#L23) | M | CAT-2 | [ ] |
| CAT-4 | Jersey detail page by slug: variants, sizes, stock | Click any jersey → `/jerseys/<slug>`; DevTools → `GET /api/jerseys/<slug>` | [JerseyDetailPage.tsx](../frontend/src/pages/JerseyDetailPage.tsx), [api.ts:91](../frontend/src/services/api.ts#L91) | [catalog.service.ts:149](../backend/src/modules/catalog/catalog.service.ts#L149) | M | CAT-3 | [ ] |
| CAT-5 | Semantic (meaning-based) search endpoint over pgvector 👻 | `curl "http://localhost:5000/api/search/semantic?q=retro%20red%20italian%20kit"` | [api.ts:100](../frontend/src/services/api.ts#L100) (defined, not called; see Unsure) | [search.routes.ts](../backend/src/modules/search/search.routes.ts), [search.controller.ts](../backend/src/modules/search/search.controller.ts), [embeddingService.ts](../backend/src/services/embeddingService.ts) | L | DATA-2, DATA-3 | [ ] |

## 4. Cart

The cart works for guests too: the browser keeps a session ID in `localStorage` and sends
it as `x-session-id`; a signed-in user's cart is tied to their user ID.

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| CART-1 | Guest session ID + load cart on app start | DevTools → Application → Local Storage → `shopmate_session_id`; Network → `GET /api/cart` on page load | [api.ts:5](../frontend/src/services/api.ts#L5), [App.tsx:27](../frontend/src/App.tsx#L27), [cartSlice.ts:26](../frontend/src/store/slices/cartSlice.ts#L26) | [cart.controller.ts:12](../backend/src/modules/cart/cart.controller.ts#L12), [cart.service.ts:50](../backend/src/modules/cart/cart.service.ts#L50) | M | AUTH-3 | [ ] |
| CART-2 | Add to cart, with optional name/number printing and sleeve badge pricing | Jersey page → pick size, customise, Add to cart; `POST /api/cart/items` | [JerseyDetailPage.tsx](../frontend/src/pages/JerseyDetailPage.tsx), [cartSlice.ts:37](../frontend/src/store/slices/cartSlice.ts#L37), [api.ts:212](../frontend/src/services/api.ts#L212) | [cart.schemas.ts](../backend/src/modules/cart/cart.schemas.ts), [cart.service.ts:104](../backend/src/modules/cart/cart.service.ts#L104) | M | CART-1, CAT-4 | [ ] |
| CART-3 | Change quantity | Cart page or mini cart → +/-; `PATCH /api/cart/items/:itemId` | [cartSlice.ts:48](../frontend/src/store/slices/cartSlice.ts#L48), [api.ts:229](../frontend/src/services/api.ts#L229) | [cart.service.ts:193](../backend/src/modules/cart/cart.service.ts#L193) | S | CART-2 | [ ] |
| CART-4 | Remove item / clear cart | Remove button; `DELETE /api/cart/items/:itemId`, `DELETE /api/cart` | [cartSlice.ts:59](../frontend/src/store/slices/cartSlice.ts#L59), [api.ts:244](../frontend/src/services/api.ts#L244) | [cart.service.ts:232](../backend/src/modules/cart/cart.service.ts#L232), [cart.service.ts:258](../backend/src/modules/cart/cart.service.ts#L258) | S | CART-2 | [ ] |
| CART-5 | Mini cart drawer (slide-out, from any page) | Header → bag icon | [MiniCartDrawer.tsx](../frontend/src/components/drawers/MiniCartDrawer.tsx), [Header.tsx:208](../frontend/src/components/layout/Header.tsx#L208) | — | S | CART-2 | [ ] |
| CART-6 | Cart page with server-computed totals | `/cart` | [CartPage.tsx](../frontend/src/pages/CartPage.tsx), [api.ts:112](../frontend/src/services/api.ts#L112) (`normalizeCart`) | [cart.service.ts:276](../backend/src/modules/cart/cart.service.ts#L276) (`formatCart`) | S | CART-2 | [ ] |

## 5. Checkout, Payments & Orders

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| PAY-1 | Create PaymentIntent with server-side price and stock check | `/checkout`; DevTools → `POST /api/payments/create-intent` | [CheckoutPage.tsx](../frontend/src/pages/CheckoutPage.tsx), [api.ts:268](../frontend/src/services/api.ts#L268) | [payment.routes.ts:18](../backend/src/modules/payments/payment.routes.ts#L18), [payment.service.ts:21](../backend/src/modules/payments/payment.service.ts#L21) | L | CART-6 | [ ] |
| PAY-2 | Card payment with Stripe Elements (test mode, mock mode without a key) | `/checkout`, card `4242 4242 4242 4242` | [CheckoutPage.tsx:24](../frontend/src/pages/CheckoutPage.tsx#L24) | [stripe.ts](../backend/src/config/stripe.ts) | M | PAY-1 | [ ] |
| PAY-3 | Stripe webhook → order created in one transaction: atomic stock decrement, cart closed, idempotent 👻 | `stripe listen --forward-to localhost:5000/api/webhooks/stripe`, pay, then check `orders`, `order_items`, `jersey_variants.stockQuantity` | — | [payment.routes.ts:14](../backend/src/modules/payments/payment.routes.ts#L14), [payment.service.ts:123](../backend/src/modules/payments/payment.service.ts#L123), [payment.service.ts:147](../backend/src/modules/payments/payment.service.ts#L147) | L | PAY-1, DB transactions | [ ] |
| PAY-4 | Client-side confirm fallback (builds a synthetic webhook event when the real webhook can't reach localhost) 👻 | Pay without `stripe listen` running; DevTools → `POST /api/payments/confirm` | [api.ts:286](../frontend/src/services/api.ts#L286) | [payment.service.ts:357](../backend/src/modules/payments/payment.service.ts#L357) | M | PAY-3 | [ ] |
| PAY-5 | Order lookup and order history (user or guest email) | `/orders/<id>/success`, `/account`; `GET /api/orders/:orderId`, `GET /api/orders` | [OrderSuccessPage.tsx](../frontend/src/pages/OrderSuccessPage.tsx), [api.ts:303](../frontend/src/services/api.ts#L303) | [payment.service.ts:285](../backend/src/modules/payments/payment.service.ts#L285), [payment.service.ts:321](../backend/src/modules/payments/payment.service.ts#L321) | S | PAY-3 | [ ] |
| PAY-6 | Order success page | Finish a test payment | [OrderSuccessPage.tsx](../frontend/src/pages/OrderSuccessPage.tsx) | uses PAY-5 | S | PAY-5 | [ ] |

## 6. KitBot (AI agent)

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| AI-1 | Chat drawer UI + entry points (header, home hero prompts, catalog) | Header → KitBot button; home page prompt chips | [CopilotDrawer.tsx](../frontend/src/components/drawers/CopilotDrawer.tsx), [copilotSlice.ts](../frontend/src/store/slices/copilotSlice.ts), [HomePage.tsx:277](../frontend/src/pages/HomePage.tsx#L277) | — | M | — | [ ] |
| AI-2 | Streaming replies over Server-Sent Events (`text`, `tool_call`, `tool_result` events) | Ask KitBot anything; DevTools → `POST /api/ai/chat` → EventStream / Response | [api.ts:332](../frontend/src/services/api.ts#L332) (`streamAIChat`) | [ai.routes.ts:8](../backend/src/modules/ai/ai.routes.ts#L8), [ai.controller.ts:10](../backend/src/modules/ai/ai.controller.ts#L10) | L | OPS-5 | [ ] |
| AI-3 | Agent loop: Gemini function calling, max-loop guard, system prompt rules, model fallback | Ask "find me a retro Italian kit and add size M"; watch the backend log | — | [ai.service.ts](../backend/src/modules/ai/ai.service.ts) | L | AI-2 | [ ] |
| AI-4 | Tools: `search_jerseys`, `add_to_cart`, `get_cart_summary`, `recommend_size` (Zod-validated args) | Ask for each; the drawer shows tool cards | [CopilotDrawer.tsx:533](../frontend/src/components/drawers/CopilotDrawer.tsx#L533) | [ai.tools.ts](../backend/src/modules/ai/ai.tools.ts), [ai.schemas.ts](../backend/src/modules/ai/ai.schemas.ts) | L | AI-3, CART-2, CAT-5 | [ ] |
| AI-5 | Conversation memory in Redis (24h TTL, pruning that keeps tool-call pairs valid) 👻 | Chat, then RedisInsight → look for the session key and its TTL | — | [ai.memory.ts](../backend/src/modules/ai/ai.memory.ts) | M | AI-3, OPS-7 | [ ] |
| AI-6 | AI results update the app: catalog shows KitBot's picks, cart reloads after `add_to_cart` | Ask KitBot to search, open `/jerseys`; ask it to add an item, watch the bag count | [copilotSlice.ts:175](../frontend/src/store/slices/copilotSlice.ts#L175), [CopilotDrawer.tsx:478](../frontend/src/components/drawers/CopilotDrawer.tsx#L478), [CatalogPage.tsx:401](../frontend/src/pages/CatalogPage.tsx#L401) | — | M | AI-4 | [ ] |
| AI-7 | Signed-in vs guest context for the agent (`optionalAuth` on chat) 👻 | Chat signed in and signed out, compare whose cart `add_to_cart` changes | — | [ai.routes.ts:8](../backend/src/modules/ai/ai.routes.ts#L8), [ai.tools.ts](../backend/src/modules/ai/ai.tools.ts) (`ToolExecutionContext`) | S | AI-4, AUTH-3 | [ ] |

## 7. Data & Search Infrastructure

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| DATA-1 | Database schema & migration (Prisma): users, clubs, jerseys, variants, embeddings, carts, orders, processed webhook events | `backend/prisma/schema.prisma`; ER diagram in `docs/database` | — | [schema.prisma](../backend/prisma/schema.prisma), [migration.sql](../backend/prisma/migrations/20261002171131_init/migration.sql), [docs/database](../docs/database) | M | — | [ ] |
| DATA-2 | Seed data (clubs, jerseys, variants) 👻 | `npm run db:seed --prefix backend` | — | [seed.ts](../backend/prisma/seed.ts) | S | DATA-1 | [ ] |
| DATA-3 | Embedding sync: jersey text → 768-dim Gemini vector stored in pgvector 👻 | `npm run db:embeddings --prefix backend` (calls the Gemini API) | — | [syncEmbeddings.ts](../backend/src/scripts/syncEmbeddings.ts), [embeddingService.ts](../backend/src/services/embeddingService.ts) | M | DATA-2 | [ ] |
| DATA-4 | HNSW vector index for fast similarity search 👻 | `npm run db:hnsw --prefix backend` | — | [setupHnswIndex.ts](../backend/src/scripts/setupHnswIndex.ts) | S | DATA-3 | [ ] |

## 8. Frontend-only

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| FE-1 | Jersey customizer canvas (live name/number preview) | Jersey page → customise | [JerseyCustomizerCanvas.tsx](../frontend/src/components/customizer/JerseyCustomizerCanvas.tsx) | — | M | CAT-4 | [ ] |
| FE-2 | Design tokens + Theme Studio (palette, type, shape, contrast checker) | `/theme-studio` | [ThemeStudioPage.tsx](../frontend/src/features/theme-studio/ThemeStudioPage.tsx), [tokens.css](../frontend/src/styles/tokens.css) | — | M | — | [ ] |
| FE-3 | Redux store setup (cart + copilot slices, typed hooks) | Redux DevTools browser extension | [store/index.ts](../frontend/src/store/index.ts), [hooks.ts](../frontend/src/store/hooks.ts) | — | S | — | [ ] |

## Testing (cross-cutting)

| ID | Feature | How to see it | Frontend | Backend / other | Size | Needs | ✅ |
|---|---|---|---|---|---|---|---|
| TEST | Vitest suites: backend per module (Supertest), frontend components/slices; scripted end-to-end and search checks | `npm test --prefix backend`, `npm test --prefix frontend`, `npm run test:e2e --prefix backend` | `*.test.tsx`, [cartSlice.test.ts](../frontend/src/store/slices/cartSlice.test.ts) | `modules/*/*.test.ts`, [testEndToEndFlow.ts](../backend/src/scripts/testEndToEndFlow.ts) | M | the features they test | [ ] |

---

## ❓ Unsure

| What I saw | Where | What would confirm it |
|---|---|---|
| `GET /api/auth/me` and `PATCH /api/auth/preferences` exist, but the frontend never calls them. The account page keeps the favourite club in `localStorage` instead. | [AccountPage.tsx:21](../frontend/src/pages/AccountPage.tsx#L21), [auth.routes.ts:15](../backend/src/modules/auth/auth.routes.ts#L15) | Was saving preferences to the backend planned but never wired up? |
| `semanticSearch()` exists in the frontend API client but nothing calls it. Semantic search is only reached through KitBot's `search_jerseys` tool. The header search box does a plain keyword (`contains`) search. | [api.ts:100](../frontend/src/services/api.ts#L100), [catalog.service.ts:85](../backend/src/modules/catalog/catalog.service.ts#L85) | Search in the header and watch which request fires |
| The frontend never passes a Clerk token (`getAuthHeaders()` is called without one). Signed-in requests probably authenticate through Clerk's session cookie, which works because Vite proxies `/api` to the same origin. | [api.ts:14](../frontend/src/services/api.ts#L14), [vite.config.ts](../frontend/vite.config.ts) | Sign in, DevTools → `GET /api/cart` → Request headers: is there a `Cookie: __session=...`? Does the backend log show a user? |
| `config/db.ts` creates a raw `pg` Pool that no file imports. Prisma has its own connection. | [db.ts](../backend/src/config/db.ts) | Probably leftover code; check git history |
| `requireAdmin` middleware and the `ADMIN` role exist, but no route uses them. There is no admin feature. | [authMiddleware.ts:78](../backend/src/middlewares/authMiddleware.ts#L78) | Planned for later? |
| `/api/test-error` is a debug endpoint that is also registered in production. | [app.ts:62](../backend/src/app.ts#L62) | Intentional or should be dev-only? |

## Notes from the student

<!-- corrections, things I found that the scan missed -->
