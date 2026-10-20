# ShopMate AI (KitRoom) - Autonomous AI Developer & Production Blueprint

These rules apply to any AI agent interacting with this workspace.

---

## Universal Rules (Apply to ALL Projects)

### Workflow & Execution Mode
- **Role:** Autonomous Senior Full-Stack Engineer & Builder. Primary goal is complete, high-quality, production-grade end-to-end implementation and automated test coverage.
- **Autonomous Execution:** Silently and reliably execute required terminal commands (Docker, migrations, npm installs, builds, test runners). No confirmation gates or teaching pauses required.
- **Context Maintenance:** Keep `.agents/project_tracker.md` updated as modules are completed.

### Coding Standards
- **ES6 Modules:** Use `import` / `export` for all JavaScript/Node.js files. Never use `require()` / `module.exports`.
- **Git Branch:** The default/primary branch is always `main`, not `master`.
- **No Console.log:** Use structured logging (Pino or equivalent) in production code. `console.log` is only acceptable in throwaway debug sessions.
- **Environment Variables:** Never hardcode secrets, API keys, or connection strings. Always use `.env` files and `process.env`.
- **Strict Formatting Invariant (Zero LaTeX / Zero Dollar-Sign Math):** NEVER use LaTeX or dollar sign math syntax (`$` or `$$`) under any circumstance. Never write `$N$`, `$O(...)`, `\cos`, `\theta`, or `$$...$$`. Write all math, complexity, and variables in plain English (e.g., `O(log N)`, `N items`, `1 - Cosine Similarity`, `98 percent`).

### Frontend Standards
- **State Management:** Use **Redux Toolkit (RTK)** with typed hooks (`useAppDispatch`, `useAppSelector`) and `createSlice` for predictable global client state.
- **SEO & Semantics:** Every page must have proper `<title>`, `<meta description>`, single `<h1>`, and semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`).
- **Design Tokens:** NEVER use raw hex/rgb values in component code. All colors, fonts, spacing, and shadows must reference CSS custom properties from `index.css` and `tokens.css`.
- **Responsive Design:** Layouts must work fluidly from 375px mobile to 1440px+ desktop without horizontal overflow.
- **Accessibility:** Images need `alt` text. Interactive elements need visible focus states. Buttons must be `<button>`, not styled `<div>`.

### Backend Standards
- **Fail-Fast Startup:** Verify database connection BEFORE starting the HTTP server. If DB is unreachable, log fatal and `process.exit(1)`.
- **Parameterized Queries:** 100% of SQL queries must use parameterized inputs (`$1`, `$2`). Never concatenate user input into SQL strings.
- **Consistent Response Shape:** All API responses must follow a predictable JSON structure (`ApiResponse` / `ApiError` classes).
- **Transaction Safety:** Multi-step mutations must be wrapped in `BEGIN ... COMMIT / ROLLBACK`. Race-condition-prone resources must use `SELECT ... FOR UPDATE`.
- **Generated Database Docs:** `docs/database/` is maintained and updated after schema changes.

---

## Project-Specific Rules

### E-Commerce & Inventory Integrity
- **Server-Authoritative Pricing:** The frontend MUST NEVER transmit item prices or order totals. The backend recalculates base jersey prices, customizations (15 USD player name/number, 5 USD league badge), and taxes from the database.
- **Strict Stock Locks:** Inventory deduction in the Stripe webhook or checkout confirmation must use atomic decrement operations with a condition check (`stockQuantity >= requestedQuantity`) to prevent negative inventory and overselling.
- **Webhook Idempotency:** Stripe and Clerk webhooks must verify raw signatures and store/check processed event IDs in Postgres or Redis to guarantee safe retries.

### AI Agent & pgvector Standards
- **Safe Tool Calling:** AI function calling tools must strictly validate parameters using Zod schemas before interacting with the database or cart.
- **Vector Query Safety:** Always use parameterized SQL when executing raw `pgvector` similarity queries (`SELECT ... ORDER BY embedding <=> $1::vector LIMIT $2`).
- **SSE Connection Management:** AI streaming endpoints (`/api/ai/chat`) must set appropriate SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`), handle client disconnect events cleanly, and avoid memory leaks.

### Voice & Accessibility Rules
- **Web Speech Resilience:** Check for browser Web Speech API availability (`window.SpeechRecognition || window.webkitSpeechRecognition`). Gracefully fall back to text-only mode with clear visual indicators if unsupported or permission denied.
