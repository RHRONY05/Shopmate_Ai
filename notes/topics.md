# Topics Learned — Quick Revision & Active Recall Index

Use this file for self-testing. Read each topic bullet point and try to explain or write out the syntax from memory **before** opening the detailed reference note.

---

## 1. TypeScript

### Topics to Recall:
1. **Static Typing vs. Dynamic Typing:** Compile-time check (`tsc`) vs. runtime evaluation (V8 / Node.js).
2. **Type Erasure & Transpilation:** Why types occupy 0 bytes in compiled JavaScript and why types cannot be accessed as runtime values.
3. **`tsconfig.json` Core Directives:** What `target`, `module`, `strict`, `rootDir`, and `outDir` instruct the compiler to do.
4. **Primitive Types:** Annotating `string`, `number`, `boolean`, `null`, and `undefined`.
5. **Type Inference:** When TypeScript automatically detects the type vs. when to write explicit annotations.
6. **Arrays vs. Tuples:** Open-ended typed lists (`number[]`) vs. fixed-length and fixed-order pairs (`[number, string]`).
7. **Object Data Contracts (`interface` vs. `type`):** When to use each, extending interfaces, and defining contracts for entities.
8. **Immutability & Optionality:** `readonly` properties (preventing reassignment) and optional properties (`?`).
9. **Function Signatures:** Parameter typing, explicit return types, and the `void` return type.
10. **Typing Function Callbacks:** The `(param: Type) => ReturnType` signature and passing functions as arguments.
11. **Asynchronous TypeScript:** `Promise<T>`, why all `async` functions return a `Promise`, and checking for `null` before property access.
12. **Generics Demystified (`<T>`):** Type parameters as placeholders, avoiding `any`, and building reusable shapes like `ApiResponse<T>`.
13. **Literal Union Types:** Enforcing exact string or number options (`"HOME" | "AWAY"`) instead of broad types.
14. **Defensive Typing & Narrowing:** Why `any` is banned, using `unknown`, and narrowing with `typeof` and `in`.

👉 **Detailed Study Note:** [01-typescript.md](./01-typescript.md)

---

## 2. Docker & Redis

### Topics to Recall:
1. **Docker Compose Orchestration & Multi-Container Networking:** How bridge networks allow containers to communicate via service names.
2. **PostgreSQL 16 vs `pgvector/pgvector:pg16`:** Why standard Postgres images cannot run vector cosine distance queries.
3. **Port Mapping & Localhost vs Container DNS:** Host ports (`localhost:6379`) vs internal container DNS (`redis:6379`).
4. **Named Volumes & `driver: local` Mechanics:** How Docker persists data to local disk independently of container lifecycle.
5. **Environment Variable Interpolation & Security:** Sourcing credentials from `.env` using `${VAR:-fallback}` to avoid hardcoding.
6. **Redis Architecture: In-Memory (RAM) vs Disk (SSD):** Why RAM-based key-value stores deliver sub-millisecond latency.
7. **Redis Key-Value Operations & Sub-Millisecond Latency:** Basic operations (`SET`, `GET`, `DEL`) without relational overhead.
8. **Time-To-Live (TTL) & Auto-Expiration Mechanics:** Using `SETEX` and `TTL` to automatically discard ephemeral session data.
9. **Inspecting Redis via GUI (RedisInsight) & CLI (`redis-cli`):** Connecting to Redis via browser GUI on port 5540 and through interactive container CLI.

👉 **Detailed Study Note:** [02-docker-redis.md](./02-docker-redis.md)

---

## 3. Backend Architecture & Standards

### Topics to Recall:
1. **Fail-Fast Startup Pattern (Database & Redis before Server):** Why the HTTP server must never listen before databases are healthy.
2. **Centralized, Type-Safe Configuration (`config/env.ts`):** Validating environment variables at startup and eliminating scattered `process.env`.
3. **Structured Logging with Pino (`pino-pretty` vs Cloud JSON):** Asynchronous JSON logging vs blocking `console.log()`.
4. **HTTP Request & Response Body Interception (`pino-http`):** Capturing request IDs, status codes, latency, and response payloads.
5. **Standardized API Response Shape (`ApiResponse`):** Enforcing uniform `{ statusCode, data, message, success }` envelopes.
6. **Standardized Error Handling & Stack Traces (`ApiError`):** Creating custom error classes with HTTP status codes and validation details.
7. **Eliminating Try/Catch Duplication with `asyncHandler`:** Promise chaining wrapper for Express controllers.
8. **Global Express Error Middleware Pipeline:** Why error middleware requires exactly 4 parameters `(err, req, res, next)`.

👉 **Detailed Study Note:** [03-backend-architecture.md](./03-backend-architecture.md)  
🗺️ **The 5-Pillar Architecture Mindmap:** [backend-architecture-mindmap.md](./backend-architecture-mindmap.md)

---
