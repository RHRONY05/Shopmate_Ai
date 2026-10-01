# ShopMate AI — Project Progress & Learning Tracker

> **Current Project Status**  
> **Current Phase:** Phase 1 — Project Setup & Infrastructure Foundation  
> **Last Completed Action:** Modules 1.4 & 1.5 — Backend Standard Utilities & Fail-Fast Infrastructure Startup Complete  
> **Next Immediate Action:** Module 1.6 — Setup Frontend React 19 + Vite + TypeScript with Tailwind CSS and Redux Toolkit scaffolding

---

## Phase 0: TypeScript Foundations & Mental Model (2-Day Lab)
*Focus: Build deep mental models of TypeScript so both backend and frontend feel natural and production-grade.*

- [x] 0.1 **The Mental Model & Architecture:** JavaScript vs TypeScript under the hood, Static vs Dynamic typing, Type Erasure (transpilation), and what `tsconfig.json` really controls.
- [x] 0.2 **Core Types & Inference:** Primitive types (`string`, `number`, `boolean`, `null`, `undefined`), Arrays, Tuples, and understanding TypeScript's automatic type inference.
- [x] 0.3 **Data Contracts:** Object typing, `type` vs `interface` (industry guidelines on when to use which), optional properties (`?`), and readonly fields.
- [x] 0.4 **Mastering Functions:** Parameter typing, return type annotations, optional & default parameters, and typing function callbacks.
- [x] 0.5 **Asynchronous TypeScript:** Typing Callbacks, Promises (`Promise<T>`), and `async/await` return shapes.
- [x] 0.6 **Generics Demystified:** Why `<T>` exists without the academic jargon, building a reusable, typed `ApiResponse<T>`.
- [x] 0.7 **Type Safety & Defensive Code:** Literal union types (`'HOME' | 'AWAY'`), Type Narrowing (`typeof`, `in`, discriminated unions), and why `any` is banned in favor of `unknown`.
- [x] 0.8 **Hands-On Lab Challenge:** Refactor a buggy, untyped vanilla JS shopping cart into bulletproof, type-safe TypeScript. Write `notes/01-typescript.md`.

---

## Phase 1: Project Setup & Infrastructure Foundation
*What You'll Learn: Monorepos, Docker multi-container networking, fail-fast architecture, and Pino structured logging.*

- [x] 1.1 Initialize project workspace structure (`backend/`, `frontend/`, and root scripts)
- [x] 1.2 **Docker & Redis Intro:** Learn why Docker Compose is used, configure PostgreSQL 16 (`pgvector/pgvector:pg16`) and Redis (`redis:7-alpine`). Explain the Redis in-memory mental model.
- [x] 1.3 Setup Backend TypeScript environment with ES Modules, strict typing, and npm scripts
- [x] 1.4 Implement Backend standard utility infrastructure (`ApiResponse`, `ApiError`, `asyncHandler`, Pino structured logger with request/response body capture)
- [x] 1.5 Implement Backend Fail-Fast Database and Redis connection health check before server listen (`app.ts` + `server.ts`)
- [/] 1.6 Setup Frontend React 19 + Vite + TypeScript with Tailwind CSS and Redux Toolkit scaffolding

---

## Phase 2: Database Architecture, Prisma ORM & Seed Data
*What You'll Learn: Prisma migrations, relational database design, and pgvector cosine embeddings.*

- [ ] 2.1 **Prisma ORM Deep-Dive:** Learn Prisma vs traditional SQL queries, configure PostgreSQL connection and enable `pgvector` extension
- [ ] 2.2 Define database schema models (`User`, `Club`, `Jersey`, `JerseyVariant`, `JerseyEmbedding`, `Cart`, `CartItem`, `Order`, `OrderItem`)
- [ ] 2.3 Run database migrations and generate typed Prisma Client
- [ ] 2.4 Build realistic football kit seed script (20+ kits across EPL, La Liga, Serie A, Retro classic kits, and sizes S-XXL)
- [ ] 2.5 **pgvector & Embeddings Deep-Dive:** Learn what a 768-dimension embedding vector represents, generate embeddings using Gemini API, and store in `JerseyEmbedding`
- [ ] 2.6 Verify vector cosine index (`HNSW`) and query latency in PostgreSQL

---

## Phase 3: Backend Core Modules (Vertical Slices & Testing)
*What You'll Learn: Clean Architecture, Clerk Auth session handling, Stripe PaymentIntents, Webhook signatures, and atomic row-locks.*

- [ ] 3.1 Build Catalog Vertical Slice (`GET /api/clubs`, `GET /api/jerseys` with faceted filtering, `GET /api/jerseys/:slug`) + Jest/Supertest tests
- [ ] 3.2 Build Cart Vertical Slice (Session & authenticated cart persistence, inventory check, custom printing addons) + tests
- [ ] 3.3 **Clerk Auth Deep-Dive:** Learn how third-party auth tokens flow to Express, verify Bearer tokens, build user sync webhook + tests
- [ ] 3.4 **Stripe Architecture Deep-Dive:** Learn the Client vs Server trust model, implement `POST /api/payments/create-intent` with server-calculated price verification + tests
- [ ] 3.5 **Webhook Idempotency & Database Locks:** Build Stripe webhook listener with atomic inventory decrement, row-locks (`BEGIN...COMMIT`), and idempotency checks + tests

---

## Phase 4: AI Shopping Agent Engine (pgvector, Function Calling & SSE Streaming)
*What You'll Learn: LLM Function Calling mechanics, Server-Sent Events (SSE) streaming vs WebSockets, and Redis session memory.*

- [ ] 4.1 Implement `pgvector` Semantic Search Service with parameterized cosine distance (`<=>`) queries
- [ ] 4.2 **AI Function Calling Deep-Dive:** Learn how LLMs trigger external tools with Zod schema validation (`search_jerseys`, `add_to_cart`, `get_cart_summary`, `recommend_size`)
- [ ] 4.3 **SSE Streaming Deep-Dive:** Learn why SSE is used over WebSockets for AI chat, implement streaming controller (`POST /api/ai/chat`)
- [ ] 4.4 **Redis in Action:** Wire LLM tool execution loop with Redis multi-turn session conversation memory and TTL expiration
- [ ] 4.5 Write comprehensive integration tests for AI agent tool execution and streaming response

---

## Phase 5: Frontend Design System & Redux Toolkit Shell
*What You'll Learn: Modern Redux Toolkit (`createSlice`, typed hooks), Design Tokens, and the Web Speech API.*

- [ ] 5.1 Establish kitroom design tokens in `index.css` (athletic dark/light palettes, pitch-green accents, typography tokens)
- [ ] 5.2 **Redux Toolkit Setup:** Configure typed store, create `cartSlice` and `copilotSlice` with typed actions and selectors
- [ ] 5.3 Build Global Navigation Shell (Header, League MegaMenu, Search bar trigger, Redux cart badge, Clerk Auth modal)
- [ ] 5.4 Build persistent slide-out AI KitBot Copilot Drawer with streaming message bubble renderer
- [ ] 5.5 **Web Speech API Deep-Dive:** Integrate Voice-to-Text mic input (`SpeechRecognition`) and Speech Synthesis toggle (`speechSynthesis` TTS)
- [ ] 5.6 Build Quick Mini-Cart slide-over tray connected to Redux store with optimistic updates

---

## Phase 6: Frontend Screens & Full-Stack Integration
*What You'll Learn: 4-stage page assembly, 4-state async machines, canvas jersey printing preview, and Stripe Elements.*

- [ ] 6.1 Build Storefront Landing Page (`/`) with Hero voice chips, trending drops carousel, and club badges
- [ ] 6.2 Build Jersey Catalog Page (`/jerseys`) with multi-facet sidebar (Leagues, clubs, eras, sizes, price slider)
- [ ] 6.3 Build Jersey Detail Page (`/jerseys/:slug`) with high-res gallery, size stock status, and custom name/number canvas preview
- [ ] 6.4 Build Full Cart & Checkout Page (`/cart`, `/checkout`) with Stripe Elements embedded payment form
- [ ] 6.5 Build Order Confirmation Page (`/orders/:orderId/success`) with receipt and tracking timeline
- [ ] 6.6 Build User Account & Order History Page (`/account`) with saved preferences

---

## Phase 7: End-to-End Polish, Resilience & Production CI/CD
*What You'll Learn: GitHub Actions workflows, production multi-stage Docker builds, and defensive UX.*

- [ ] 7.1 Conduct complete end-to-end user flow walkthrough (Voice discovery -> AI Add to Cart -> Customization -> Stripe payment)
- [ ] 7.2 Implement 4-state async machine validation (idle, loading skeletons, success, error toasts) across all screens
- [ ] 7.3 Set up GitHub Actions CI workflow (linting, type checking, Supertest automated tests)
- [ ] 7.4 Create production multi-stage Dockerfiles and container configurations
- [ ] 7.5 Connect Production Cloud Monitoring with Better Stack / Logtail for live streaming logs
