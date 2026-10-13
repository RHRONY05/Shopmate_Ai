# Design Brief — ShopMate AI (KitRoom Edition)

> **Phase:** Design Canvas (Step 1 — Gate 1)  
> **Status:** Pending User Approval  
> **Design Tokens Source:** [design/tokens.css](file:///d:/Projects/ShopMate_AI/design/tokens.css) (Stadium Matchday & Pitch Emerald, Royal Trophy & Crest `Cinzel` + `Lusitana`, Soft Radius/Shadow, Snappy Motion)  

---

## 1. Direction & Creative Intent

- **Direction:** **Regal Matchday Kitroom**
- **Three Adjectives:** *Regal, Authentic, Tactile*
- **The Explicit NOT List:**
  1. **NOT** a neon-glow gamer drop site with artificial urgency timers, spinning wheels, or purple gradient mesh blobs.
  2. **NOT** a generic dropshipping storefront with cluttered discount badges, fake review popups, or low-contrast grey cards.
  3. **NOT** a sterile white-label athletic catalogue that treats historic football kits like commodity gym t-shirts.
- **One Signature Element:**
  - **The Matchday Authentication Ticket Stub (`.auth-ticket`):** A physical kitroom ticket stub with subtle serrated coupon edges, an embossed metallic club crest seal, and player squad typography (#07 SAKA) inspired by vintage stadium turnstile passes. It appears on the jersey detail customizer, the cart printing summary, and the order receipt.
- **Voice & Tone:**
  - Authoritative, refined, and passionate European kit curator. Speaks with authentic football heritage terminology ("Matchday Player Edition", "Jacquard breathable knit", "3D heat-sealed crest", "Official Premier League sleeve patch"). Clear, concise, and respectful of club legacy.

---

## 2. Screen Scope & Artboard Inventory

We will design artboards across two key user experience groups on both **Mobile (390px)** and **Desktop (1440px)**:

### Group 1: Shopper Flow (`screens/shopper/`)

| # | Screen File | Dimensions | Target Role | Key Elements & Layout |
|---|---|---|---|---|
| **S1** | `home.html` | Phone: 390 × 1600<br>Desktop: 1440 × 1850 | Storefront Entry | Hero matchday spotlight, quick voice prompt chips ("Find 90s retro kits"), league navigation rail, trending drops grid |
| **S2** | `catalog.html` | Phone: 390 × 1450<br>Desktop: 1440 × 1600 | Catalog & Faceted Search | Multi-facet filter sidebar (League, Club, Era, Kit Type, Size, Price), sort bar, kit product grid |
| **S3** | `jersey-detail.html` | Phone: 390 × 1700<br>Desktop: 1440 × 1500 | Product Detail (PDP) | Multi-angle kit photography, European size selector (S–XXL) with stock indicator, interactive squad printing toggle |
| **S4** | `cart.html` | Phone: 390 × 950<br>Desktop: 1440 × 1100 | Full Shopping Bag | Itemized jersey list with customization details, server-verified pricing breakdown, turnstile promo voucher input |
| **S5** | `checkout.html` | Phone: 390 × 1100<br>Desktop: 1440 × 1200 | Secure Checkout | Shipping address fields, Stripe Elements embedded payment container, order summary breakdown |
| **S6** | `order-success.html` | Phone: 390 × 920<br>Desktop: 1440 × 1000 | Order Receipt | Digital certificate of authenticity, delivery timeline, order reference number, tracking status |

### Group 2: Overlays & Persistent Drawers (`screens/drawers/`)

| # | Screen File | Dimensions | Purpose | Key Elements |
|---|---|---|---|---|
| **D1** | `copilot-drawer.html` | Phone: 390 × 844<br>Desktop: 1440 × 900 (Overlay) | Persistent AI KitBot Drawer | Real-time SSE streaming bubbles, Web Speech voice input mic button, tool-execution status badges, embedded kit action cards |
| **D2** | `mini-cart-drawer.html` | Phone: 390 × 844<br>Desktop: 1440 × 900 (Overlay) | Slide-Over Quick Cart | Instant slide-out tray, quantity adjusters, subtotal calculation, direct checkout CTA |

### Group 3: States & Edge Cases (`screens/variants/`)

- `cart--empty.html` (Phone: 390 × 844) — Clean empty state with zero clutter, reassuring message, and 3 quick category launch chips.
- `catalog--empty.html` (Desktop: 1440 × 900) — Zero search results with smart alternative recommendations and an AI stylist query button.
- `copilot--searching.html` (Phone: 390 × 844) — Active semantic vector search loading state showing pgvector similarity tool badges.

---

## 3. Devices & Responsive Strategy

- **Mobile Phone (390 × 844):**
  - All primary actions placed in the natural thumb zone (bottom third of screen).
  - Sticky bottom action bar (`.nav-bottom` / `.bottom-cta`) with `env(safe-area-inset-bottom)` safety.
  - Generous touch targets (minimum 44 × 44px with 8px spacing).
  - Single column with peekable horizontal category pills.
- **Desktop (1440 × 900+):**
  - True **recomposition** (not a stretched mobile column): Left faceted filter rail, 3-column jersey grid, sticky checkout order sidebar, and persistent right slide-out AI copilot drawer.
  - Content capped at `--container-max: 1240px` with generous vertical rhythm (`--space-12` to `--space-16` between sections).

---

## 4. Motion Specification (Snappy Personality)

Using tokens defined in [design/tokens.css](file:///d:/Projects/ShopMate_AI/design/tokens.css):

| Moment | Micro-Interaction Spec |
|---|---|
| **1. Primary Button Tap** | `transform: scale(0.97)` over `--dur-instant` (80ms); releases over `--dur-fast` (140ms) with `--ease-out`. |
| **2. Add to Bag Confirmation** | Button morphs into quantity stepper over `--dur-base` (220ms); header cart badge scales `1 → 1.15 → 1` with `--ease-spring`. |
| **3. Copilot Drawer Slide** | Drawer enters from right `translateX(100% → 0)` over `--dur-slow` (320ms) `--ease-out`; backdrop fades in over `--dur-base` (220ms). |
| **4. Squad Printing Preview Flip** | Back-printing jersey visual flips with subtle 3D card rotation over `--dur-base` (220ms) `--ease-in-out`. |
| **5. AI Tool Execution Badge** | Semantic query badge reveals with 12px slide-up and soft single pulse over `--dur-fast` (140ms). |

*All animations wrapped in `@media (prefers-reduced-motion: no-preference)` with instant opacity fallbacks.*

---

## 5. Asset Inventory & Labelled Placeholders (`.ph`)

Until official production assets are verified, all images will use token-styled labelled placeholders (`.ph`):
- `[HERO] Authentic Matchday Stadium Atmosphere (16:9 Desktop / 4:3 Phone)`
- `[CREST] Official Club Badges (Arsenal, Real Madrid, Juventus, Barcelona, AC Milan, Bayern - 1:1)`
- `[KIT-PHOTO] Jersey Front & Back High-Res Photography (3:4 Ratio)`
- `[BADGE] Official Premier League & UEFA Champions League Sleeve Patches (1:1)`
