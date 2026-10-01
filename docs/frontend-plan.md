# Frontend Plan — ShopMate AI (KitRoom Edition)

## 1. Requirements Interview (Frontend)

### Core Purpose
ShopMate AI is a premier football jersey & kitroom web application featuring an intelligent, voice-and-chat-enabled AI shopping assistant. The interface allows football enthusiasts to browse, filter, discover (via semantic search like *"Retro Barcelona away jersey with Ronaldinho"* or *"Lightweight Brazil 2002 kit under $60"*), customize (player name & number printing), add to cart, and seamlessly checkout with Stripe.

### Target Users
- Football / soccer fans, kit collectors, and players looking for authentic, replica, and retro club/national team jerseys.
- Users who value fast conversational discovery over clicking through dozens of nested filter menus.

### Data Source
- Custom Express + TypeScript REST API.
- Live SSE (Server-Sent Events) stream for real-time word-by-word AI agent responses and tool execution triggers.
- PostgreSQL + `pgvector` backend accessed through the API.

### Key User Actions
1. **Explore & Filter Catalog:** Browse clubs (e.g., Premier League, La Liga, Serie A, International), filter by kit type (Home/Away/Third/Retro), season, and size.
2. **Interactive AI Copilot Assistance:** Open the persistent Copilot drawer, chat or speak via voice ("Find me an Arsenal retro jersey in size L under $70"), receive streaming recommendations with interactive product cards, and trigger direct "Add to Cart" or "Show Checkout" actions from chat.
3. **Product Customization & Details:** View high-res images, select size, choose player badge/number printing option (e.g., "Bellingham #5"), check real-time stock availability.
4. **Cart & Sliding Drawer Management:** Review cart items, modify quantities, inspect shipping/tax totals, and sync cart state with AI commands.
5. **Seamless Checkout:** Complete Stripe payment flow (Stripe Checkout / Elements in test mode), receive instant order confirmation and digital receipt.
6. **User Account & Order History:** Sign in with third-party auth (Clerk), view past kit orders, tracking numbers, and saved preferences (favorite club/size).

### Auth Requirements
- Third-party authentication powered by **Clerk** (supporting Social OAuth like Google/GitHub, email/passcode, user profiles, session tokens verified on Express backend).

### Tech Stack Constraints
- **Framework:** React 19 + Vite (TypeScript, strict mode).
- **Styling:** Tailwind CSS + Radix UI / shadcn/ui primitives.
- **State Management:** Redux Toolkit (RTK) with typed hooks (`useAppDispatch`, `useAppSelector`) and `createSlice` for predictable client state (Cart, KitBot Drawer, Voice/Audio state).
- **AI Streaming:** Native `fetch` with `ReadableStream` / EventSource for SSE.
- **Voice APIs:** Web Speech API (`SpeechRecognition` for voice-to-text, `speechSynthesis` for AI voice responses).
- **Icons & Micro-interactions:** Lucide React, Framer Motion for smooth drawer transitions.

### Device Targets
- **Responsive / Mobile-First Priority:** Optimized for fluid mobile experience (375px) with bottom sheet drawer, and rich desktop experience (1440px+) with persistent slide-out right drawer copilot.

---

## 2. Screen Inventory

### Full Pages

| # | Screen Name | Route | Purpose | Auth Required | Data Needed |
|---|-------------|-------|---------|---------------|-------------|
| 1 | **Home / Storefront** | `/` | Showcase trending kits, league banners (EPL, La Liga, UCL, Retro), AI quick-prompts, and editor's picks | No | Trending jerseys, featured collections, banner metadata |
| 2 | **Catalog & Search** | `/jerseys` | Filterable and searchable product grid with facets (club, league, season, kit type, size, price range) | No | Paginated jersey list, total count, facet aggregates |
| 3 | **Jersey Detail (PDP)** | `/jerseys/:slug` | High-res imagery, size selector with stock indicator, custom name/number printing options, kit specs | No | Full product details, stock per size, customization prices |
| 4 | **Shopping Cart** | `/cart` | Itemized cart summary, custom printing review, shipping estimate, subtotal calculation | No | Cart line items, pricing, inventory availability checks |
| 5 | **Checkout** | `/checkout` | Shipping/billing address collection, Stripe Elements embedded payment card, order breakdown | Yes (or verified email) | Stripe client secret, user addresses, active cart snapshot |
| 6 | **Order Confirmation** | `/orders/:orderId/success` | Payment verification status, order reference number, delivery tracking info, digital receipt | Yes (or signed token) | Order details, payment status, customer receipt |
| 7 | **User Account & Order History** | `/account` | Manage profile, view historical jersey orders, tracking statuses, and saved preferences (favorite team/size) | Yes (Clerk) | User profile, historical order list, delivery statuses |

### Persistent Drawers & Overlay Modals

| Overlay Component | Trigger | Purpose |
|-------------------|---------|---------|
| **AI KitBot Copilot Drawer** | Floating assistant button on all pages or keyboard shortcut (`Cmd/Ctrl + K`) | Slide-out right panel (or bottom sheet on mobile) with streaming AI chat, speech-to-text mic, TTS voice output, tool-execution badges, and interactive product action cards |
| **Quick Mini-Cart Slide-over** | Cart icon in navbar or triggered upon adding an item | Fast slide-out drawer showing active items, quantity adjusters, subtotal, and instant "Checkout" button without navigating away |
| **Auth Modal (Clerk)** | "Sign In" button in navbar or checkout prompt | Seamless third-party authentication via Clerk (Google OAuth, GitHub, Email/Passcode) |
| **Custom Kit Printing Preview Modal** | "Preview Back Printing" button on Jersey Detail page | Visual preview of the back of the jersey rendering the chosen player name, squad number, and league badge |
| **Search Command Palette** | Header search bar or `Ctrl/Cmd + /` | Instant search modal featuring recent searches, trending clubs, and direct AI query suggestions |

---

## 3. Sitemap Tree

```
App Root
├── / (Home / Storefront)
│   ├── [AI KitBot Copilot Drawer] (Omnipresent trigger: FAB / Header button)
│   ├── [Quick Mini-Cart Drawer] (Navbar cart button trigger)
│   ├── [Search Command Palette] (Cmd/Ctrl + K or header search click)
│   └── [Auth Modal] (Clerk sign-in modal trigger)
├── /jerseys (Catalog & Filtering)
│   └── ?league=epl&club=arsenal&kitType=home&season=2024-25
├── /jerseys/:slug (Jersey Detail Page)
│   ├── [Custom Kit Printing Preview Modal]
│   └── → Add to Cart → opens [Quick Mini-Cart Drawer]
├── /cart (Full Shopping Cart)
│   └── → Checkout CTA → /checkout
├── /checkout (Checkout Page - Gated / Email Verified)
│   └── Stripe Elements payment process → /orders/:orderId/success
├── /orders/:orderId/success (Order Confirmation & Receipt)
└── /account (User Dashboard) [requires auth - Clerk]
    ├── /account/orders (Historical Orders & Tracking)
    └── /account/preferences (Favorite Club, Default Size)
```

---

## 4. User Flow Diagrams

### Flow 1: Conversational AI Kit Discovery & Action Execution (Voice / Chat)
```
User clicks floating KitBot Copilot (or taps voice mic button)
    ↓
User speaks: "Find me a retro Arsenal away jersey under $80 in size L"
    ↓
Web Speech API transcribes voice to text → sends to /api/ai/chat (SSE Stream)
    ↓
AI LLM streams reasoning & triggers tool call:
    search_jerseys({ club: "Arsenal", kitType: "Away", era: "Retro", maxPrice: 80, size: "L" })
    ↓
UI renders "Searching retro kits..." badge → returns 2 matched jersey cards inside the chat bubble
    ↓
User taps "Add to Cart" directly on the chat card (or speaks: "Add the 1998 one to my cart")
    ↓
AI triggers tool call: add_to_cart({ jerseyId, size: "L", quantity: 1 })
    ↓
Redux cart store syncs, badge bumps to '1', mini-cart drawer offers subtle confirmation
    ↓
AI responds with TTS audio synthesis: "I've added the Arsenal 1998 Retro Away Kit in Size L to your cart. Ready to checkout?"
```

### Flow 2: Traditional Browsing & Custom Name/Number Personalization
```
User browses /jerseys → filters by "La Liga" + "Real Madrid"
    ↓
Clicks on "Real Madrid 2024/25 Home Kit" → loads /jerseys/real-madrid-2024-25-home
    ↓
Selects Size "L" → checks stock status (e.g., "Only 3 left in stock")
    ↓
Checks "Add Custom Name & Number" (+ $15.00)
    ↓
Enters: Name "BELLINGHAM", Number "5", checks "UCL 15-Time Winners Badge" (+ $5.00)
    ↓
Clicks "Preview Printing" → modal displays high-fidelity jersey back graphic
    ↓
Clicks "Add to Cart" → Quick Mini-Cart Drawer slides out showing line item with printing breakdown
    ↓
User clicks "Proceed to Checkout" → /checkout
```

### Flow 3: Stripe Checkout & Payment Webhook Fulfillment
```
User enters /checkout (Clerk authenticated or guest with verified email)
    ↓
Frontend requests POST /api/payments/create-intent with cart session ID
    ↓
Backend validates inventory row locks with PostgreSQL transaction & computes total with Stripe SDK
    ↓
Returns Stripe clientSecret → Frontend mounts Stripe Elements (Card, Apple Pay, Google Pay)
    ↓
User submits payment → Stripe processes payment
    ├── FAILURE → Stripe Elements shows inline card decline error
    └── SUCCESS → Stripe sends payment_intent.succeeded webhook to Express backend
          ↓
Backend updates Order status from PENDING to PAID in Prisma, decrements inventory stock
          ↓
Frontend redirects to /orders/:orderId/success with digital receipt & tracking code
```

---

## 5. Component Inventory & Low-Fidelity Wireframes

### Global Shell
- `Navbar`: Brand logo, Category mega-menu (Leagues: Premier League, La Liga, Serie A, International, Retro), Search trigger, KitBot trigger, Cart badge count, Clerk UserButton / Sign In.
- `KitBotDrawer`: Slide-over drawer with chat message history, voice mic trigger, volume toggle (TTS enable/disable), quick suggestion chips, live tool execution indicators, rendered `ProductActionCard`.
- `MiniCartDrawer`: Sliding tray with item thumbnail, size, customized print specs, quantity stepper, subtotal, and "Checkout" button.
- `Footer`: Newsletter signup, club index, shipping info, currency selector, authenticity guarantee.

### Page Wireframes (Low-Fidelity)

#### 1. Home / Storefront (`/`)
```
┌─────────────────────────────────────────────────────────────┐
│ [Navbar: ShopMate AI | Leagues | Retro | Search | Mic | Cart]│
├─────────────────────────────────────────────────────────────┤
│ [Hero: "Find Your Match Kit with AI" - Voice Prompt Trigger] │
│   "Find 2024 Euros shirts"  "Retro 90s kits"  "Under $60"   │
├─────────────────────────────────────────────────────────────┤
│ [League Carousel: Premier League | La Liga | Serie A | etc.] │
├─────────────────────────────────────────────────────────────┤
│ [Featured Drops / Trending Kits Grid (4 cols)]               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Kit Card │ │ Kit Card │ │ Kit Card │ │ Kit Card │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│ [AI Agent Value Banner: "Ask KitBot anything via Voice/Chat"]│
└─────────────────────────────────────────────────────────────┘
```

#### 2. Jersey Detail Page (`/jerseys/:slug`)
```
┌─────────────────────────────────────────────────────────────┐
│ [Breadcrumbs: Home > La Liga > Real Madrid > 24/25 Home]    │
├──────────────────────────────┬──────────────────────────────┤
│ [Image Gallery]              │ [Club Badge + Title]         │
│  - Main high-res view        │ Real Madrid 2024/25 Home Kit │
│  - Thumbnails (front, back,  │ $95.00                       │
│    fabric texture, badges)   ├──────────────────────────────┤
│                              │ [Size Selector: S, M, L, XL] │
│                              │ In Stock (4 remaining)       │
│                              ├──────────────────────────────┤
│                              │ [Custom Printing Option]     │
│                              │ [x] Player Name: [BELLINGHAM]│
│                              │ [x] Number:      [5]         │
│                              │ [x] Sleeve Badge: [ UCL +15] │
│                              │ [Preview Printing Button]    │
│                              ├──────────────────────────────┤
│                              │ [Add to Cart] [Ask AI About] │
│                              ├──────────────────────────────┤
│                              │ [Kit Specs & Authenticity]   │
└──────────────────────────────┴──────────────────────────────┘
```

#### 3. AI KitBot Copilot Drawer (`Persistent Slide-out Drawer`)
```
┌──────────────────────────────────────────────────┐
│ [Header: KitBot AI | Voice: ON/OFF | Close (X)]  │
├──────────────────────────────────────────────────┤
│ [Chat Scroll Area]                               │
│  Bot: "Hey! What jersey are you looking for?"    │
│  User: "Show me retro Barcelona away kits"       │
│  Bot: [Tool: Searching kits...]                  │
│       "Here is the legendary 1996/97 Kappa Away:"│
│       ┌────────────────────────────────────────┐ │
│       │ [Img] Barcelona 1996 Away (Teal)       │ │
│       │ Size: L | $85.00                       │ │
│       │ [Add to Cart] [View Details]           │ │
│       └────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ [Prompt Chips: "Check my size" "Show retro kits"]│
│ [Input Box: "Ask KitBot..." | Mic (Voice) | Send]│
└──────────────────────────────────────────────────┘
```


