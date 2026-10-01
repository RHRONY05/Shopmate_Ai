# ShopMate AI — Engineering Notes & Knowledge Base

Welcome to your project knowledge repository. This folder contains your permanent, personal reference notes for all core technologies mastered while building ShopMate AI.

---

## 🧭 The 4-Question Note Template

For every major technology or milestone, add a note file (`01-typescript.md`, `02-redis.md`, `03-stripe.md`, `04-pgvector.md`, `05-redux-toolkit.md`) answering these four questions:

```markdown
# [Technology Name] — Production Cheat Sheet

### 1. The Core Problem
*Why did standard JavaScript or traditional databases fail here? What exact engineering problem made this tool necessary?*

### 2. The Mental Model
*How do I visualize how this works? (Analogy or system diagram)*

### 3. The 5 Core Production Patterns
*The exact code snippets, functions, or queries I wrote in this project that I will use again in future jobs.*

### 4. Gotchas & Lessons Learned
*The top 2 bugs or pitfalls I encountered and how I fixed them.*
```

---

## 🎯 Scope Boundaries Tracker

| Topic | Note File | Status | Core Focus |
|---|---|---|---|
| **TypeScript** | `notes/01-typescript.md` | Completed (Phase 0) | Type Erasure, Primitives, Objects, Functions, Promises, Generics `<T>` |
| **Docker & Compose** | `notes/02-docker.md` | Pending (Phase 1) | Container networking, Volumes, Multi-container coordination |
| **PostgreSQL & Prisma** | `notes/03-database.md` | Pending (Phase 2) | Relations, Migrations, Indexes, Atomic transactions |
| **pgvector Embeddings** | `notes/04-pgvector.md` | Pending (Phase 2) | Cosine similarity `<=>`, HNSW index, Semantic retrieval |
| **Stripe & Payments** | `notes/05-stripe.md` | Pending (Phase 3) | PaymentIntents, Webhook signatures, Idempotency |
| **Redis** | `notes/06-redis.md` | Pending (Phase 4) | In-memory key-value, TTL, Cache-aside pattern, Session state |
| **Redux Toolkit (RTK)** | `notes/07-redux.md` | Pending (Phase 5) | `createSlice`, Typed hooks (`useAppDispatch`, `useAppSelector`) |
| **Web Speech API** | `notes/08-voice.md` | Pending (Phase 5) | Browser SpeechRecognition & SpeechSynthesis fallbacks |
