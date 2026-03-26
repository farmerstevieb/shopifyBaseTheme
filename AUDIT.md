# Remi Cachet / Additional Lengths — Full Audit & Roadmap
_Generated: 2026-03-03_

---

## 1. Codebase Structure

### Theme Architecture
Both stores run on **eComplete Core Framework v2.6.0** — a custom Shopify theme with:
- **Webpack** build pipeline, **pnpm**, **TypeScript**, **TailwindCSS v3 + SCSS**
- **React 19** for Nosto search/recommendation templates
- Custom **Larken** typeface embedded as WOFF2 assets
- Shopify Markets support (GB / EU / US context JSON variants per section/template)
- `shopify.theme.toml` environments: `remi-cachet` (B2B) / `additionallengths` (B2C)

### Projects
| Project | Path | Shopify Store | Type |
|---|---|---|---|
| remi-cachet | `/projects/ima/remi-cachet` | `remi-cachet` | B2B Pro |
| additional-lengths | `/projects/ima/additional-lengths` | `additionallengths` | B2C |
| commerce-bridge | `/projects/commerce-bridge` | — | PHP middleware |

---

## 2. Installed Apps (detected in theme code)

| App | Evidence | Status |
|---|---|---|
| **LoyaltyLion** | `data-lion-*` attrs, `loyalty-page.liquid`, cart points snippet, "Cachet Club" branding | Active — thin integration only |
| **Nosto** | Full React template suite, predictive search, collection/search templates | Well integrated |
| **TrustPilot** | Dedicated section, business stats snippet, TS module | Active |
| **Pandectes** | Cookie consent, renders in `<head>` before any scripts | Good |
| **Klaviyo** | Custom `NewsletterConnector.ts` | Active |
| **Geo-IP Blocker** | Custom `GeoIpBlocker.js` | Custom-built |

### App Concerns
- **LoyaltyLion** — paying for a platform, not using tier/segmentation APIs. The loyalty page just drops in `data-lion-integrated-page` (generic widget). No tier logic, no personalised account journey.
- **No product reviews app** — TrustPilot is brand-level only. No Yotpo/Okendo/Judge.me at product level.
- **No subscription app** detected.

---

## 3. Remi Cachet vs Additional Lengths — Differences

| Feature | Remi Cachet (B2B) | Additional Lengths (B2C) |
|---|---|---|
| Loyalty | LoyaltyLion + Cachet Club page | None |
| TrustPilot | Yes | No |
| AJAX collection filtering | No | Yes (full suite) |
| Custom variant picker | No | Yes |
| Training pages | Yes (3 variants) | No |
| B2B context templates | Yes | No |
| Multi-market | GB / EU / US | US only |
| User drawer (account) | Yes | No (dialog instead) |
| Product schema JSON-LD | No | Yes |
| USPS footer section | No | Yes |
| Password/404 sections | No | Yes |

**Backport candidates from B2C → B2B:**
- AJAX facets suite (collection filtering)
- Product schema JSON-LD
- Custom variant picker
- USPS footer section

---

## 4. What Exists vs What's Missing

### Profit Calculator
- **Not found** in theme or commerce-bridge source code
- Training product templates exist (`product.hollywood-weave-training.json`) which could host it
- Need to locate existing code — check branches, commerce-bridge `/src/templates`, or separate project

### Educational Hub
- Training templates exist: `page.training.json`, `page.training-new.json`, `page.training-hollywood-weave.json`
- Structural bones are there — not yet a structured hub with progression, gating, or tracking

### Loyalty Program (4 Tiers)
- LoyaltyLion is installed but purely widget-based
- No tier display in account dashboard
- No theme-level personalisation based on tier
- No B2B-specific tier logic

---

## 5. Core Web Vitals — Watch Points

Already performing well. Key risks to monitor:
- Nosto React bundle — ensure lazy-loaded, not blocking initial render
- LCP hero images — verify NOT lazy-loaded (custom `Lazyload.ts` must exclude above-the-fold)
- Pandectes in `<head>` — verify not render-blocking (should be non-blocking script)
- Multiple font variants loaded — only preload the weights actually used above the fold

---

## 6. B2B Marketplace Improvements

1. **Gated content** — Training/resources gated behind login + tier (use `section/_user-restriction.liquid` which exists)
2. **Product schema** — Port `product-schema.liquid` from additional-lengths
3. **AJAX collection filtering** — Port facets suite from additional-lengths
4. **Account dashboard** — Add tier status, points balance, tier progress, exclusive resources
5. **B2B pricing display** — Make trade/volume pricing visible and compelling on PDPs

---

## 7. Feature Build Plan

### A. Loyalty Program — 4-Tier Overhaul

**Proposed tiers (to confirm with client):**
| Tier | Name | Entry | Key Benefits |
|---|---|---|---|
| 1 | Stylist | New account | Training access, standard pricing |
| 2 | Pro | Spend/order threshold | Discounted pricing, priority support |
| 3 | Elite | Higher spend | Exclusive products, early access |
| 4 | Master | Top tier | Personal account manager, best pricing |

**Theme work needed:**
- `snippets/loyalty/_tier-badge.liquid` — tier display in header/drawer
- `snippets/loyalty/_tier-benefits.liquid` — benefits block for account page
- `snippets/loyalty/_tier-progress.liquid` — progress bar to next tier
- Update `main-account.liquid` — tier dashboard
- Update `drawer-user.liquid` — tier badge
- Gate sections using `customer.tags` (LoyaltyLion writes tier tags)

### B. Profit Calculator

**Inputs:**
- Wholesale cost (can auto-populate from B2B price)
- Retail price
- Number of applications per pack
- Labour cost

**Outputs:**
- Gross margin %
- Net profit per application
- Monthly profit projection (with volume slider)

**Implementation:**
- New section: `sections/profit-calculator.liquid`
- New JS module: `src/js/main/profit-calculator/ProfitCalculator.ts`
- React component (fits existing stack)
- Embeddable on any page via page builder

### C. Educational Hub

**Architecture:**
- Repurpose blog system as educational hub
- New collection template: `collection.education-hub.json`
- New page template: `page.education-hub.json`
- Content types: Video tutorials, technique guides, colour theory, aftercare
- Gating: Free content for all logged-in users; advanced gated to Pro+ tier
- Reward completion: LoyaltyLion custom events for points

**Sections needed:**
- `sections/education-hub-hero.liquid`
- `sections/education-hub-categories.liquid`
- `sections/education-video.liquid` (extend existing video section)
- `sections/education-hub-progress.liquid` (tier-gated)

### D. Personalised Logged-In Journey

- **Header**: Tier badge in account drawer (`drawer-user.liquid`)
- **Homepage**: `index.context.b2b.json` logged-in variant with personalised hero/products
- **Account dashboard**: Tier progress, points, exclusive content links, reorder history
- **PDP**: "You earn X points with this order" (cart snippet exists — extend to PDP)
- **Cart**: Points preview (already exists in `loyalty/_cart-points.liquid`)

---

## 8. Commerce-Bridge Integration Points

The hair extension module should expose to Shopify:
- Customer tier data → Shopify customer tags / metafields
- Profit margin data per product → product metafields (feed the calculator)
- Educational content progress → customer metafields

These feed the theme's personalisation logic without additional apps.

---

## 9. Priority Order

| # | Task | Impact | Effort |
|---|---|---|---|
| 1 | Extract base template to `shopifyBaseTheme` | High | Medium |
| 2 | Loyalty 4-tier system + account dashboard | High | High |
| 3 | Personalised logged-in journey | High | Medium |
| 4 | Locate + implement profit calculator | High | Medium |
| 5 | Educational hub | Medium | High |
| 6 | AJAX collection filtering (backport from B2C) | Medium | Low |
| 7 | Product schema JSON-LD (backport from B2C) | Medium | Low |
| 8 | Product reviews at product level | Medium | Low |

---

## 10. Base Template Migration Strategy

See `shopifyBaseTheme/GIT_DEPLOYMENT_GUIDE.md` for full workflow.

**TL;DR:**
- Extract eComplete Core Framework into a clean `shopifyBaseTheme` repo (no client config)
- Each new client gets a git clone of the base
- Per-client customisation in: `shopify.theme.toml`, `tailwind.config.js`, `settings_schema.json`, `assets/` (fonts), `locales/` (copy)
- Core architecture (sections, snippets, JS modules, build tooling) stays upstream-mergeable
- GitHub "Template Repository" feature enables one-click new client project creation
