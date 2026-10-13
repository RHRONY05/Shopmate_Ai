// Design canvas manifest — read by canvas.html and scripts/shoot.mjs.
// Keep groups and screens in user-flow order. Paths are relative to this folder.
// status: "draft" | "review" | "changes" | "approved"   (only the user approves)
window.CANVAS = {
  title: "ShopMate AI (KitRoom)",
  themes: ["light", "dark"],
  groups: [
    {
      id: "kit",
      title: "Component Kit",
      screens: [
        { file: "screens/_kit/components.html", title: "Kit · Components & States", w: 1440, h: 2400, status: "approved" }
      ]
    },
    {
      id: "shopper",
      title: "Shopper Flow",
      screens: [
        { file: "screens/shopper/home.html", title: "S1 · Storefront Home (Phone)", w: 390, h: 2550, status: "approved" },
        { file: "screens/shopper/home-desktop.html", title: "S1 · Storefront Home (Desktop)", w: 1440, h: 2050, status: "approved" },
        { file: "screens/shopper/catalog.html", title: "S2 · Catalog & Jersey Listing (Phone)", w: 390, h: 3950, status: "approved" },
        { file: "screens/shopper/catalog-desktop.html", title: "S2 · Catalog & Jersey Listing (Desktop)", w: 1440, h: 2550, status: "approved" },
        { file: "screens/shopper/jersey-detail.html", title: "S3 · Jersey Detail & Customization (Phone)", w: 390, h: 2500, status: "approved" },
        { file: "screens/shopper/jersey-detail-desktop.html", title: "S3 · Jersey Detail & Customization (Desktop)", w: 1440, h: 2150, status: "approved" },
        { file: "screens/shopper/cart.html", title: "S4 · Cart & Shopping Bag (Phone)", w: 390, h: 2200, status: "approved" },
        { file: "screens/shopper/cart-desktop.html", title: "S4 · Cart & Shopping Bag (Desktop)", w: 1440, h: 1900, status: "approved" },
        { file: "screens/shopper/checkout.html", title: "S5 · Checkout & Turnstile Payment (Phone)", w: 390, h: 2200, status: "approved" },
        { file: "screens/shopper/checkout-desktop.html", title: "S5 · Checkout & Turnstile Payment (Desktop)", w: 1440, h: 2000, status: "approved" },
        { file: "screens/shopper/order-success.html", title: "S6 · Order Success & Cryptographic Certificate (Phone)", w: 390, h: 2400, status: "approved" },
        { file: "screens/shopper/order-success-desktop.html", title: "S6 · Order Success & Cryptographic Certificate (Desktop)", w: 1440, h: 1950, status: "approved" }
      ]
    }
  ]
};
