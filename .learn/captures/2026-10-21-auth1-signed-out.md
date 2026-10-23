# AUTH-1 capture · signed out · 2026-10-21

Frontend only (`npm run dev --prefix frontend`), backend not running. Commit `0b5e898`.

## Clerk requests on page load (performance resource entries, query strings trimmed)

```text
https://selected-oryx-1101.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js
https://selected-oryx-1101.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.128.0&_method=PATCH&__clerk_db_jwt=dvb_…
https://selected-oryx-1101.clerk.accounts.dev/v1/client?__clerk_api_version=2025-11-10&_clerk_js_version=5.128.0&__clerk_db_jwt=dvb_…
https://selected-oryx-1101.clerk.accounts.dev/npm/@clerk/clerk-js@5.128.0/dist/framework_clerk.browser_70f75e_5.128.0.js
https://selected-oryx-1101.clerk.accounts.dev/npm/@clerk/clerk-js@5.128.0/dist/vendors_clerk.browser_70f75e_5.128.0.js
https://selected-oryx-1101.clerk.accounts.dev/npm/@clerk/clerk-js@5.128.0/dist/ui-common_clerk.browser_70f75e_5.128.0.js
```

Our own API calls on the same load: `GET /api/jerseys?limit=12` and `GET /api/cart` → 500 (backend not running; Vite proxy error).

## window.Clerk (signed out)

```json
{ "loaded": true, "frontendApi": "selected-oryx-1101.clerk.accounts.dev", "user": null, "session": null }
```

## Cookies on localhost:5173 (names; values trimmed)

```text
__clerk_db_jwt_cF7qR6HO, __clerk_db_jwt   = dvb_3K…   (development browser token)
__client_uat_cF7qR6HO, __client_uat       = 0         (0 = no signed-in client)
__stripe_mid, __stripe_sid                            (Stripe.js, unrelated)
__session                                 → absent
```

## Publishable key, decoded

```text
prefix: pk_test_
base64 part decodes to: "selected-oryx-1101.clerk.accounts.dev$"
```

## Sign-in modal (after clicking Sign In)

Inputs: `identifier` (email). Social buttons: Facebook, Google, X. Footer: "Don't have an account? Sign up", "Secured by Clerk", "Development mode".
New network calls: only to `selected-oryx-1101.clerk.accounts.dev/v1/...`. None to `/api/...`.

## Break-it check: empty VITE_CLERK_PUBLISHABLE_KEY (temporary server on :5174)

`#root` had 0 children (blank page). Console:

```text
Uncaught Error: @clerk/clerk-react: SignedIn can only be used within the <ClerkProvider /> component.
    at SignedIn (...@clerk_clerk-react.js...)
```
