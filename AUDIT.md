# eComplete Shopify Base Theme — Audit

_This document describes the base theme itself. It must stay client-agnostic — no client
names, store handles, or client-specific app stacks belong here. Client-specific findings
belong in that client's own project repo, not here._

---

## 1. What this repo is

`ecomplete-shopify-base` (mirrored to `farmerstevieb/shopifyBaseTheme`) is the white-label
Shopify OS 2.0 foundation every client project forks from. It ships app-free by design —
apps are added per client, in that client's own fork, never here.

**Stack:** Webpack build pipeline, pnpm, TypeScript, TailwindCSS v3 + SCSS, Shopify CLI.
Source lives under `shopify/`, compiled to `dist/` (gitignored, built locally per environment).

**Current size:** 77 sections, 70 snippets under `shopify/`.

## 2. Build & dev pipeline

Real scripts, from `package.json`:

| Script | Purpose |
|---|---|
| `npm run dev` | Parallel webpack watch + `shopify theme dev` |
| `npm run build` | Full production build: webpack → flatten-snippets → inject-schemas → generate-theme-assets |
| `npm run merge` | Fast `shopify/` → `dist/` sync without a full rebuild |
| `npm run theme:push` / `theme:pull` | Wrapped Shopify CLI push/pull |
| `npm run promote:staging` / `promote:main` | Theme promotion pipeline, single-store support |
| `npm run lint` | `stylelint` (SCSS) + `shopify theme check` in parallel |

Schema convention: JS files in `shopify/sections/schema/*.js` are injected into compiled
Liquid at build time by `scripts/inject-schemas.js`, with shared building blocks under
`shopify/sections/schema/parts/` (`sectionSettings`, `aspectRatios`, `gridSpacing`,
`content`, `dialog`, etc.).

## 3. First-party platform integrations vs. the app-free policy

"App-free" means no *third-party* apps are wired into the base theme. eComplete's own
first-party platform pieces are part of the base and are expected here:

- **eComplete Search** — `shopify/snippets/ecomplete-search.liquid`, `shopify/sections/cart-upsell.liquid`,
  `shopify/snippets/upsell-drawer.liquid` call a first-party app-proxy (`/apps/ecompleteSearch/api/*`)
  for search, upsell, and chat. This is the platform's own search/upsell module, not a
  per-client third-party add-on.

**Fixed:** `shopify/sections/main-order.liquid` hardcoded a link to a **third-party** invoice
app (`/apps/sufio/invoice/download/...`) unconditionally. Gated behind a new
`show_sufio_invoice` section setting (`shopify/sections/schema/main-order.js`), off by
default — a client fork only sees the link if they explicitly enable it after installing
Sufio themselves.

## 4. Known TODOs in the codebase

Real markers found via `grep -rn "TODO\|FIXME" shopify/`, not exhaustive investigation —
listed so they're tracked instead of silently living in code comments:

- `shopify/snippets/product-variant-options.liquid:68,134,161` — sold-out/unavailable
  variant label is hardcoded English, not yet moved to `locales/*.json`.
- `shopify/snippets/product-media-gallery.liquid:64`, `product-media-modal.liquid:48`,
  `sections/main-product-quickshop.liquid:128` — image alt-tag parsing assumes exactly one
  option value (e.g. colour) is encoded in the alt tag; breaks for multi-option alt schemes.
- `shopify/snippets/product-buy-buttons.liquid:31` — add-to-cart error path has no handling.
- `shopify/sections/schema/parts/spacing.js:47`, `sectionSettings.js:77` — the "Padded"
  spacing option label is a placeholder pending a better name.

## 5. White-label conventions

- Brand identity (logo, colours, typography) is driven entirely through
  `config/settings_schema.json` + `settings_data.json` — no brand name or asset should be
  hardcoded in `.liquid`/`.scss` source. Per-client logo variants belong in
  `shopify/snippets/theme-brand-logos.liquid` as a named `brand_logo` select option, not as
  inline markup in section files.
- `theme_info` (`config/settings_schema.json`) carries the forking org's own name/branding
  and is expected to diverge between `farmerstevieb/shopifyBaseTheme` and
  `ecomplete/ecomplete-shopify-base` — that's the one deliberate, intentional difference
  between the two mirrors; everything else should stay in sync via each side's own port process.

## 6. Repo relationship

`farmerstevieb/shopifyBaseTheme` and `ecomplete/ecomplete-shopify-base` are two separately
maintained lineages, not a shared git history — each side ports the same substantive fixes
independently. Don't assume a commit merged on one side has automatically reached the other;
verify before relying on a fix being present in both.
