# eComplete Platform Roadmap

## Table of Contents

- [Architecture — Dual-Path IP Separation](#architecture--dual-path-ip-separation)
- [Current State](#current-state)
- [Module Plans](#module-plans)
  - [1. eComplete Search (AI-native)](#1-ecomplete-search-ai-native)
  - [2. Wishlist (Enterprise — Swym competitor)](#2-wishlist-enterprise--swym-competitor)
  - [3. Upsell / Cross-sell (Market leader)](#3-upsell--cross-sell-market-leader)
  - [4. Loyalty Program (Smile.io / LoyaltyLion competitor)](#4-loyalty-program-smileio--loyaltylion-competitor)
- [Multi-Platform Base Themes](#multi-platform-base-themes)
  - [5. Magento 2 Base Theme (ground-up, not Hyvä fork)](#5-magento-2-base-theme-ground-up)
  - [6. WooCommerce / WordPress Base Theme](#6-woocommerce--wordpress-base-theme)
- [Admin UI — Platform Selector](#admin-ui--platform-selector)
- [Commerce Bridge Integration](#commerce-bridge-integration)
- [Repo Map](#repo-map)
- [Foxify / Minimog Gap Analysis](#foxify--minimog-gap-analysis)
- [Phase Plan](#phase-plan)

---

## Architecture — Dual-Path IP Separation

The base themes and modules exist as a **single source of truth** with dual-labelling:

```
Single codebase
  ├── Push to Farm-IT-Ltd repos  → labelled "farmit-*"
  └── Push to ecomplete repos    → labelled "ecomplete-*"
```

### Rules

1. **Same code, two remotes.** Each base theme repo has two git remotes:
   - `origin` → `ecomplete/<repo>` (eComplete's property)
   - `farmit` → `Farm-IT-Ltd/<repo>` (Farm-IT's working copy)

2. **Branding is config, not code.** Base themes use env vars / config files for branding:
   - `PLATFORM_BRAND=ecomplete` or `PLATFORM_BRAND=farmit`
   - Package names, README headers, licence text swap based on this

3. **Divergence starts when they push.** eComplete may commit changes to their repos that Farm-IT doesn't pull. At that point the repos fork naturally. Currently Steve runs both — single source, dual push.

4. **Modules are eComplete IP.** The wishlist, search, upsell, loyalty modules are eComplete's products. Farm-IT (Commerce Bridge) consumes them via API as a customer, never forks the source.

5. **Infrastructure is Farm-IT IP.** Terraform, GPU hosting, CI/CD pipelines, Ollama models — Farm-IT's property. eComplete pays for usage (or moves to own account later).

### How dual-push works in practice

```bash
# In any base theme or module repo:
git remote add farmit git@github.com:Farm-IT-Ltd/<repo>.git
git remote add origin git@github.com:ecomplete/<repo>.git

# Push to both:
git push origin main
git push farmit main

# When eComplete diverges (their team pushes independently):
# Farm-IT stops pulling from origin, works from farmit remote only
# Repos are now independent — no IP contamination
```

---

## Current State

### What's built and deployed

| Component | Status | Repo |
|---|---|---|
| Shopify Base Theme | DONE — production-ready | `farmerstevieb/shopifyBaseTheme` + `ecomplete/ecomplete-shopify-base` |
| Theme Builder admin UI | DONE — live at d1d3aksfd7p614.cloudfront.net | `ecomplete/ecomplete-api` + `Farm-IT-Ltd/ecomplete-api` |
| Theme Builder job API (Lambda) | DONE | `ecomplete/ecomplete-api` (packages/lambda) |
| Auth Lambda (login, getMe, listUsers) | DONE | `ecomplete/ecomplete-api` (packages/lambda) |
| Admin wizard — 18 features / 6 categories | DONE | `ecomplete/ecomplete-api` (packages/admin) |
| CORS fix | DONE | `ecomplete/ecomplete-api` (packages/lambda) |
| Wishlist backend | DONE (DynamoDB + Lambda + Express) | `ecomplete/ecomplete-api` (packages/core) |
| Back-in-stock notify | DONE | `ecomplete/ecomplete-api` (packages/core) |
| Wishlist enterprise — named lists, sharing, analytics | In progress | `ecomplete/ecomplete-api` (packages/core) |
| Upsell module — rules, tracking, analytics | In progress | `ecomplete/ecomplete-api` (packages/upsell) |
| eComplete Search | DONE — live on ecompleteplus.myshopify.com + pepkor.ecomplete.co.za | `ecomplete/ecomplete-search` (Shopify app, Remix) |
| Infrastructure | DONE — Terraform in CB stack, shared GPU | `Farm-IT-Ltd/farmit-commercebridge-stockorder` |

### What's built on the theme side (as of 2026-03-22)

| Component | Status | Notes |
|---|---|---|
| Wishlist theme UI | DONE | snippets, section, page template, JS module, SCSS |
| Back-in-stock theme UI | DONE | notify-me snippet, JS module |
| Recently viewed products | DONE | section, JS module, SCSS |
| Cookie consent banner | DONE | snippet, JS module, global settings, SCSS |
| Countdown timer section | DONE | section, schema, JS module, SCSS |
| Newsletter popup | DONE | snippet, JS module, SCSS |
| Compare products | DONE | snippet, section, JS module, SCSS |
| Age verification | DONE | snippet, JS module, global settings, SCSS |
| Infinite scroll | DONE | Pagination.js enhanced with IntersectionObserver |
| Testimonials section | DONE | section, schema, SCSS |
| Blog subscribe | DONE | snippet, SCSS |
| Size guide popup | DONE | existing PDP popup block (config-only) |
| Product badges | DONE | product-stickers.liquid (existing) |

### What's not built yet

| Component | Status |
|---|---|
| Search — AI enhancements + base theme integration | In progress |
| Upsell / Cross-sell — theme snippets | Planned — Phase 2 |
| Loyalty program — theme snippets + Shopify Function | Planned — Phase 3 |
| Shopify App: eComplete Search | Published (pepkor.ecomplete.co.za) — packaging as standalone app |
| Shopify App: eComplete Wishlist | Planned |
| Shopify App: eComplete Upsell | Planned |
| Shopify App: eComplete Loyalty | Planned |
| Magento 2 base theme | Planned — Phase 4 |
| Magento 2 Module: Search | Planned — Phase 4 |
| Magento 2 Module: Wishlist | Planned — Phase 4 |
| Magento 2 Module: Upsell | Planned — Phase 4 |
| Magento 2 Module: Loyalty | Planned — Phase 4 |
| WooCommerce base theme | Planned — Phase 5 |
| WooCommerce Plugin: Search | Planned — Phase 5 |
| WooCommerce Plugin: Wishlist | Planned — Phase 5 |
| WooCommerce Plugin: Upsell | Planned — Phase 5 |
| WooCommerce Plugin: Loyalty | Planned — Phase 5 |
| Admin UI platform selector (Shopify/M2/WC) | Planned — Phase 4 |

---

## Module Plans

### 1. eComplete Search (AI-native)

**Current state:** `ecomplete/pepSearch` is live on ecompleteplus.myshopify.com. It's a Shopify app (Remix + Prisma) with:
- NLP query parsing (metafield extraction, stop words)
- Product indexing service
- Search cache (in-memory, TTL-based)
- `do-search` theme app extension
- Domain mappings (multi-store)
- App proxy at `/apps/PepSearch`
- Dev store: `ecompleteplus.myshopify.com`

**Plan — evolve pepSearch into eComplete Search:**

| Enhancement | Description |
|---|---|
| **Rebrand** | Rename from PepSearch → eComplete Search (app name, extension, proxy path) |
| **Remove Groq logins** | Strip any Groq API credentials, replace with Ollama or native |
| **Semantic search** | Add Ollama embeddings — product descriptions → vectors, semantic similarity matching |
| **Visual search** | Upload image → shopify-visual-coder matches to products in catalogue |
| **AI autocomplete** | Contextual suggestions based on browsing history + popular searches |
| **Typo tolerance** | Fuzzy matching with Levenshtein distance + AI reranking |
| **Analytics dashboard** | Search terms, zero-results, click-through rates — in admin UI |
| **Multi-platform** | Extract search logic into standalone API (not Shopify-app-only) |
| **Base theme integration** | Replace native Shopify predictive search in base theme with eComplete Search |

**Repos:**
- `ecomplete/pepSearch` → rename to `ecomplete/ecomplete-search` (or keep repo, rebrand internally)
- Search API endpoints added to `ecomplete/ecomplete-api` for platform-agnostic use
- Theme extension stays as Shopify app extension for Shopify stores

### 2. Wishlist (Enterprise — Swym competitor)

**Current state:** Backend is DONE in ecomplete-api. No theme-side UI exists.

**Enterprise features to build:**

| Feature | Swym | Ours |
|---|---|---|
| Save items | Yes | Yes (done) |
| Multiple named lists | Yes | Build |
| Share lists (link / email / social) | Yes | Build |
| Price drop alerts | Yes | Build (extend notify service) |
| Back-in-stock alerts | Yes | Done |
| Guest → customer sync | Yes | Build (localStorage + API merge on login) |
| Analytics dashboard | Yes | Build (in admin UI) |
| Social proof ("X people wishlisted") | No | Build |
| AI recommendations from wishlists | No | Build (Ollama: collaborative filtering) |
| Multi-store / multi-currency | Limited | Done (shopDomain-scoped in API) |
| Zero app dependency | No (requires app install) | Yes (API + theme snippet) |
| White-label for agencies | No | Yes |
| Headless / multi-platform | No | Yes (API-first, works on any frontend) |

**Architecture:**

```
ecomplete-api/packages/core (backend — done)
  ├── WishlistService (CRUD — done)
  ├── NotifyService (back-in-stock — done)
  ├── + WishlistListService (multiple named lists — build)
  ├── + WishlistShareService (share links — build)
  ├── + WishlistAnalyticsService (social proof, stats — build)
  └── DynamoDB tables: ecomplete-wishlist, ecomplete-notify

shopifyBaseTheme (theme-side — build)
  ├── snippets/wishlist-button.liquid (heart icon on cards + PDP)
  ├── snippets/wishlist-count.liquid (header badge)
  ├── sections/wishlist-page.liquid (full page: lists, items, share)
  ├── templates/page.wishlist.json
  └── src/js/modules/wishlist.ts (API client, localStorage guest cache, login sync)

ecomplete-api/packages/admin (dashboard — build)
  └── Wishlist analytics: wishlisted products, conversion rate, top lists
```

### 3. Upsell / Cross-sell (Market leader)

**Current state:** Two basic sections in base theme using native Shopify recommendations. No backend logic, no analytics, no AI.

**Full feature set:**

| Feature | Description |
|---|---|
| **Cart upsell drawer** | Slide-out after add-to-cart with contextual recommendations |
| **PDP "Complete the look"** | Outfit/set builder from metafield relationships |
| **"Frequently bought together"** | AI-analysed order history → auto-generated bundles |
| **Checkout upsell** | Shopify Checkout UI Extension — last-chance offers |
| **Post-purchase upsell** | Thank-you page one-click add (Checkout Extension) |
| **Progressive discounts** | "Add 2 more for 15% off" with live counter |
| **Time-limited offers** | Countdown timer on cart upsells |
| **A/B testing** | Which placements/products convert best |
| **Revenue attribution** | Dashboard: "$X revenue from upsells this month" |
| **AI bundles** | Ollama analyses purchase patterns → suggests new bundles |
| **Manual rules** | Admin sets specific product → upsell mappings via metafields |

**Architecture:**

```
ecomplete-api/packages/upsell (backend — build)
  ├── RecommendationEngine (Shopify API + AI analysis)
  ├── BundleService (create/manage bundles)
  ├── UpsellAnalytics (revenue tracking, A/B results)
  └── DynamoDB: ecomplete-upsell-rules, ecomplete-upsell-analytics

shopifyBaseTheme (theme-side — build)
  ├── sections/cart-upsell.liquid (in-cart recommendations)
  ├── sections/product-upsell.liquid (PDP "complete the look")
  ├── snippets/upsell-drawer.liquid (post-add-to-cart slide-out)
  ├── snippets/upsell-countdown.liquid (time-limited offer)
  └── src/js/modules/upsell.ts (API client, drawer logic, A/B tracking)

Shopify Extensions (build)
  ├── checkout-upsell/ (Checkout UI Extension)
  └── post-purchase-upsell/ (Post-purchase Extension)
```

### 4. Loyalty Program (Smile.io / LoyaltyLion competitor)

**Current state:** Nothing exists. eComplete has `SAA-Voyager-Miles` (airline-specific, not reusable).

**Full feature set:**

| Feature | Smile.io | LoyaltyLion | Ours |
|---|---|---|---|
| Points per $ spent | Yes | Yes | Yes |
| Action points (review, share, signup, birthday) | Yes | Yes | Yes |
| Tier system (Bronze→Platinum) | Yes | Yes | Yes — fully configurable |
| Tier perks (multipliers, free shipping, early access) | Yes | Yes | Yes |
| Referral program | Yes | Yes | Yes — dual reward |
| Points redemption at checkout | Yes | Yes | Yes — Shopify Function / Magento cart rule |
| VIP locked content/collections | No | Yes | Yes |
| Gamification (challenges, streaks, bonus events) | Limited | No | Yes |
| Expiring points | Yes | Yes | Yes — configurable TTL |
| Multi-store shared points | No | No | Yes — same customer email |
| API-first (headless) | No | Limited | Yes |
| White-label | No | No | Yes |
| Zero app dependency (Shopify) | No | No | Yes — API + theme + Shopify Function |
| AI: churn prediction | No | No | Yes — Ollama analyses at-risk customers |
| AI: optimal reward timing | No | No | Yes — "send offer now" based on patterns |

**Architecture:**

```
ecomplete-api/packages/loyalty (backend — build)
  ├── PointsLedger (earn/redeem/balance/history)
  ├── TierEngine (thresholds, multipliers, auto-promotion)
  ├── RulesEngine (configurable earn rules per action type)
  ├── ReferralService (unique links, dual rewards, tracking)
  ├── RedemptionService (generate discount codes, Shopify Functions)
  ├── CampaignService (bonus events, double points weekends)
  ├── LoyaltyAnalytics (retention, LTV impact, tier distribution)
  └── DynamoDB tables:
      ├── ecomplete-loyalty-ledger (customerId, points, transactions)
      ├── ecomplete-loyalty-tiers (tier definitions, thresholds)
      ├── ecomplete-loyalty-rules (earn rules, campaign rules)
      └── ecomplete-loyalty-referrals (codes, rewards, tracking)

shopifyBaseTheme (theme-side — build)
  ├── sections/loyalty-dashboard.liquid (points, tier, history, rewards)
  ├── snippets/loyalty-banner.liquid (header points balance)
  ├── snippets/loyalty-earn-prompt.liquid ("earn X points on this purchase")
  ├── snippets/loyalty-tier-badge.liquid (customer tier display)
  ├── templates/page.loyalty.json
  └── src/js/modules/loyalty.ts (API client, checkout integration)

Shopify Extensions (build)
  ├── loyalty-discount-function/ (Shopify Function — apply points as discount)
  └── loyalty-checkout-ui/ (Checkout UI Extension — redeem points at checkout)

ecomplete-api/packages/admin (dashboard — extend)
  └── Loyalty admin: configure tiers, rules, campaigns, view analytics
```

---

## Multi-Platform Base Themes

### 5. Magento 2 Base Theme (ground-up)

**NOT a Hyvä fork.** Built from scratch with the same tech stack (Alpine.js + Tailwind) but owned IP, zero licence cost.

**Repo:** `ecomplete/ecomplete-magento-base` + `Farm-IT-Ltd/ecomplete-magento-base`

**Stack:**

| Layer | Choice | Why |
|---|---|---|
| CSS | Tailwind CSS 3 + PostCSS | Same as Shopify base, consistent tooling |
| JS | Alpine.js + vanilla ES modules | Same reactivity model as Hyvä, no RequireJS |
| Build | Vite | Matches Shopify base theme tooling |
| Templates | phtml (Alpine components) | Native Magento, no Knockout dependency |
| Layout | Clean XML, no Luma/Blank inheritance | Full control, no legacy baggage |

**Default Magento 2 modules to cover:**

| Category | Modules |
|---|---|
| **Catalog** | Product list, PDP (simple/configurable/grouped/bundle/downloadable), category page, layered navigation, compare, recently viewed |
| **Search** | Elasticsearch/OpenSearch integration, autocomplete, faceted search |
| **Cart** | Mini-cart, full cart page, coupon application, shipping estimator |
| **Checkout** | One-page checkout, shipping methods, payment methods, guest checkout |
| **Customer** | Login/register, account dashboard, address book, order history, saved payment |
| **CMS** | Pages, blocks, widgets, Page Builder compatibility, media gallery |
| **Catalog Extras** | Swatches (colour/size), configurable products, tier pricing, custom options |
| **Marketing** | Newsletter, cart price rules, catalog price rules, related/upsell/cross-sell |
| **SEO** | Sitemap, canonical URLs, meta tags, structured data (JSON-LD), hreflang |
| **Multi** | Multi-store, multi-currency, multi-language, store switcher |
| **MSI** | Multi-source inventory, source selection, pickup locations |
| **GraphQL** | Full GraphQL schema coverage (headless-ready) |

**Popular extension compatibility:**

| Extension | Approach |
|---|---|
| Elasticsearch/OpenSearch | Built-in M2.4+, ensure templates work |
| Page Builder | Support Page Builder content types in theme |
| Amasty (various) | Ensure CSS/JS doesn't conflict |
| Mageworx (SEO) | Template hooks in correct locations |
| MagePlaza (various) | Standard Magento template override pattern |
| Hyva compatibility modules | Not needed — we're not Hyvä, we're our own theme |

**Module system (same as Shopify base → client overlay):**

```
ecomplete-magento-base/           ← base theme (white-label)
client-magento-project/
  ├── base/                       ← git submodule → ecomplete-magento-base
  ├── app/design/frontend/Client/ ← client overlay (colours, fonts, templates)
  ├── scripts/merge.sh            ← same pattern as Shopify
  └── composer.json               ← client-specific modules
```

### 6. WooCommerce / WordPress Base Theme

**Repo:** `ecomplete/ecomplete-woocommerce-base` + `Farm-IT-Ltd/ecomplete-woocommerce-base`

**Stack:** Block theme (Full Site Editing) + Tailwind + Alpine.js

**Covers:** WooCommerce storefront, checkout, cart, customer account, product pages, category pages, search, plus standard WordPress pages, posts, navigation, widgets.

**Same overlay pattern:** base theme as submodule, client-specific overrides layered on top.

---

## Admin UI — Platform Selector

Update the ecomplete-api admin wizard to support multi-platform builds:

```
Step 1: Figma design (same for all platforms)
Step 2: Platform selection
         ┌─────────────────────────────────────┐
         │  ○ Shopify    ○ Magento 2           │
         │  ○ WooCommerce  ○ WordPress         │
         └─────────────────────────────────────┘
Step 3: Platform-specific credentials
         Shopify:    store handle + Admin API token
         Magento:    SSH/API endpoint + admin credentials
         WooCommerce: site URL + REST API key/secret
         WordPress:  site URL + Application Password
Step 4: Features / modules to include
         (module list changes per platform)
Step 5: Preview + Build
```

The job-runner selects the right:
- Base theme repo (`shopifyBaseTheme` / `ecomplete-magento-base` / `ecomplete-woocommerce-base`)
- Coder model (may need platform-specific fine-tunes)
- Deploy method (`shopify theme push` / `bin/magento` / `wp-cli`)

---

## Commerce Bridge Integration

Commerce Bridge (Farm-IT IP) consumes eComplete modules **as an API customer**, never forks the source:

```
Commerce Bridge (Farm-IT IP)
  ├── Storefront calls eComplete API:
  │   ├── GET/POST /wishlist     (customer wishlists)
  │   ├── GET /search            (product search)
  │   ├── GET /loyalty/balance   (points balance)
  │   └── GET /upsell/recommend  (product recommendations)
  │
  ├── Admin dashboard embeds:
  │   ├── Wishlist analytics (iframe / API)
  │   ├── Loyalty program config (iframe / API)
  │   └── Search analytics (iframe / API)
  │
  └── Same functionality, different brand:
      - CB-hosted stores get enterprise features
      - eComplete modules remain eComplete's IP
      - CB pays for hosting (already does — same AWS)
      - When eComplete moves to own account → CB becomes API customer
```

**Alternative (if CB needs own modules without eComplete dependency):**
Build equivalent features natively in CB using the same architectural patterns but different code. Same DynamoDB schemas, same API contracts, but Farm-IT's own implementation. This creates a clean separation but doubles the development work.

**Recommended approach:** Use eComplete's modules via API for now, build CB's own only if/when the relationship changes.

---

## Repo Map

### eComplete (their IP)

| Repo | Purpose | Status |
|---|---|---|
| `ecomplete/ecomplete-api` | Theme Builder platform — admin UI, job API, all module backends | Active |
| `ecomplete/ecomplete-shopify-base` | Shopify base theme | Active |
| `ecomplete/ecomplete-magento-base` | Magento 2 base theme (ground-up, Alpine.js + Tailwind) | To create — Phase 4 |
| `ecomplete/ecomplete-woocommerce-base` | WooCommerce base theme (FSE + Tailwind + Alpine.js) | To create — Phase 5 |
| `ecomplete/ecomplete-search` | Search Shopify app (live on pepkor.ecomplete.co.za) | Active (was `pepSearch`) |
| `ecomplete/hydraulics-shopify` | Client: Hydraulics | Active |
| `ecomplete/ecomplete-shopify-dev-agent` | n8n dev agent | Active |
| `ecomplete/*` | All client stores | Per-client |

### Farm-IT (your IP / working copies)

| Repo | Purpose |
|---|---|
| `Farm-IT-Ltd/ecomplete-api` | Fork — staging CI/deployment + Farm-IT infrastructure (`ecomplete.tf`) |
| `Farm-IT-Ltd/farmit-commercebridge-stockorder` | Commerce Bridge + eComplete infrastructure (Terraform, GPU, Loyalty module) |
| `farmerstevieb/shopifyBaseTheme` | Working copy of Shopify base theme |
| `farmerstevieb/hydraulics-shopify` | Working copy of Hydraulics |

### Ollama Models (EFS, not in repos)

| Model | Size | Used By |
|---|---|---|
| `shopify-coder` | 30.5B | Theme Builder — Liquid/CSS/template generation |
| `shopify-visual-coder` | 33.5B | Theme Builder — Figma analysis, visual QA |
| `commerce-bridge-coder` | 6.7B | Commerce Bridge — PHP/Tina4 code generation |
| `qwen3-coder` | 30.5B | General purpose coding |
| Future: `magento-coder` | TBD | Theme Builder — Magento phtml/XML/PHP generation |
| Future: `woocommerce-coder` | TBD | Theme Builder — WordPress/PHP/Gutenberg generation |

---

## Foxify / Minimog Gap Analysis

Features that Foxify / Minimog provide out of the box that our base theme is **missing**. These need to be built natively (no third-party app dependency) as we deprecate the Minimog references.

### Must Build — Core Gaps

| Feature | Foxify | Minimog | Base Theme | Action |
|---|---|---|---|---|
| **Wishlist** | Yes | Yes | DONE | snippets, section, page template, JS module, SCSS |
| **Back-in-stock / Notify me** | Yes | Yes | DONE | notify-me snippet, JS module |
| **Recently viewed products** | Yes | Yes | DONE | section, JS module, SCSS |
| **Countdown timer section** | Yes | Yes | DONE | section, schema, JS module, SCSS |
| **Product reviews integration** | Yes (Judge.me) | Yes (multiple) | App blocks exist, no native | Build app-agnostic review section + snippet |
| **Compare products** | Yes | Yes | DONE | snippet, section, JS module, SCSS |
| **Size guide popup** | Yes | Yes | DONE | existing PDP popup block (config-only) |
| **Cookie consent banner** | Yes | Yes | DONE | snippet, JS module, global settings, SCSS |
| **Age verification popup** | Yes | No | DONE | snippet, JS module, global settings, SCSS |
| **Infinite scroll / load more** | Yes | Yes | DONE | Pagination.js enhanced with IntersectionObserver |
| **Newsletter popup** | Yes | Yes | DONE | snippet, JS module, SCSS |
| **Blog newsletter subscribe** | Yes | Yes | DONE | snippet, SCSS |
| **Product badges / stickers** | Yes | Yes | DONE | product-stickers.liquid (existing) |
| **Subscription (ReCharge etc.)** | Yes | Yes | No | Build subscription block for PDP |

### Should Build — Competitive Parity

| Feature | Foxify | Minimog | Base Theme | Action |
|---|---|---|---|---|
| **Advanced mega menu (visual)** | Yes | Yes | Schema-driven only | Consider visual mega menu builder |
| **Lookbook / hotspots** | Yes | Yes | `bundle-hotspots.liquid` exists | Verify complete |
| **Testimonials section** | Yes | Yes | DONE | section, schema, SCSS |
| **Team / about section** | Yes | No | No | Build team grid section |
| **Timeline / history section** | Yes | No | No | Build timeline section |
| **Tabs section (standalone)** | Yes | Yes | FAQ section only | Build general-purpose tabs section |
| **Announcement bar (advanced)** | Yes | Yes | `promo-bar.liquid` exists | Verify — may need rotating messages |
| **Multi-currency switcher** | Yes | Yes | `markets.liquid` exists | Verify complete with Shopify Markets |
| **Drawer filters (mobile)** | Yes | Yes | Collection filtering exists | Verify mobile UX |
| **Quick view modal** | Yes | Yes | `main-product-quickshop.liquid` | Already exists — verify feature parity |

### Already Have (no action needed)

| Feature | Base Theme Section |
|---|---|
| Hero banner (multiple variants) | `hero-banner`, `hero-banner-columns`, `hero-banner-split` |
| Product slider | `products-slider`, `products-recommended` |
| Content cards / grid | `content-cards`, `content-cards-carousel`, `banner-grid`, `banner-collage` |
| Before/after slider | `before-after` |
| Instagram feed | `instagram` |
| Shop the look | JS module exists |
| FAQ accordion | `faq-section`, `product-faqs-section` |
| Contact form | `contact-us` |
| Rich text / editorial | `rich-text`, `text-media`, `icons-text` |
| Breadcrumbs | `breadcrumbs` |
| Gift card | `main-product-gift` |
| Cart drawer | `dialog-drawer-cart` |
| Account drawer | `dialog-drawer-account` |
| Video (HTML5/YouTube/Vimeo) | Video JS module + sections |
| USP bar | `usps-section` |
| Lightbox | JS module |
| Lazy loading | JS module |
| Geo-IP blocking | JS module |
| AJAX pagination | JS module |
| Product swatches | `swatches`, `product-swatches` |

### Priority Build Order (Foxify/Minimog gaps)

~~1. **Wishlist + back-in-stock UI** — DONE~~
~~2. **Recently viewed products** — DONE~~
~~3. **Cookie consent banner** — DONE~~
~~4. **Countdown timer section** — DONE~~
~~5. **Newsletter popup** — DONE~~
~~6. **Compare products** — DONE~~
~~7. **Size guide** — DONE (config-only popup block)~~
~~8. **Testimonials** — DONE~~
~~9. **Infinite scroll** — DONE~~
~~10. **Age verification** — DONE~~
~~11. **Blog subscribe** — DONE~~

**Remaining:**
1. **Reviews integration** (app-agnostic wrapper) — next priority
2. **Subscription block** (ReCharge etc.) — growing market

---

## eComplete Search — Confirmed Identity

**The app called "ecompleteSearch" in the Shopify admin IS the `ecomplete/pepSearch` repo.**

| Detail | Value |
|---|---|
| **GitHub repo** | `ecomplete/pepSearch` |
| **Shopify client ID** | `4dbdba87728c1e7105d69733c7f94049` |
| **Production URL** | `https://pepkor.ecomplete.co.za` |
| **Dev store** | `ecompleteplus.myshopify.com` |
| **App handle** | `PepSearch` (GitHub/code) — display name changed to "ecompleteSearch" in Shopify Partners |
| **Proxy path** | `/apps/PepSearch` |
| **Scopes** | `read_products`, `write_themes` |

**Recommendation:** Rename the GitHub repo from `pepSearch` → `ecomplete-search` for clarity, but update the Shopify app internals (handle, proxy path) in a separate planned deploy to avoid breaking the live ecompleteplus store.

---

## Local Model Strategy

All AI inference in the eComplete platform uses **Ollama local models** wherever possible. This serves two goals simultaneously: cost reduction (zero per-token cost) and continuous improvement through training on eComplete-specific patterns.

### Models and Their Domains

| Model | Purpose | Training Source |
|---|---|---|
| `ecomplete-search-base` | Intent classification, query rewriting, result reranking | Search logs, chat queries, click-through data from ecompleteplus.myshopify.com |
| `shopify-coder` | Theme code generation (Liquid, CSS, section schemas) | Build patterns, base theme conventions, hydraulics-shopify overlays |
| `shopify-visual-coder` | Figma frame analysis, QA screenshot comparison, visual diff reporting | Figma exports, before/after QA comparisons, approved design tokens |
| `commerce-bridge-coder` | PHP/Tina4 code generation for Commerce Bridge | Farm-IT-Ltd Tina4 fork repos (indexed via tina4-kb MCP) |
| Future: `magento-coder` | Magento 2 phtml/XML/PHP theme generation | ecomplete-magento-base builds |
| Future: `woocommerce-coder` | WordPress/PHP/Gutenberg theme generation | ecomplete-woocommerce-base builds |

### Training Pipeline

Training is entirely local — no cloud AI training costs:

1. **Data collection**: GA4 events + Shopify webhooks → DynamoDB `ecomplete-training` table
2. **Export**: `knowledge-base/training.ts` (in ecomplete-api) pulls approved examples and formats them as fine-tune datasets
3. **Fine-tuning**: Ollama + LoRA adapters on the EFS GPU instance — no external API calls, no data leaves the VPC
4. **Evaluation**: shopify-visual-coder compares generated output screenshots against Figma targets; failed QA rounds are logged back as negative training examples
5. **Promotion**: Approved fine-tuned weights replace the base model checkpoint on EFS

### Search Training Loop (ecomplete-search-base)

```
User query → intent classification (local model)
           → ranked results
           → click / add-to-cart / zero-results event → GA4
           → GA4 export → training dataset
           → LoRA fine-tune → better intent classification
```

GA4 click and conversion data feeds directly into training. Every search interaction improves the next model checkpoint. This is the same data that would go to Vertex AI for real-time ranking — the local Ollama step is a stepping stone, not a dead end.

### Vertex AI Stepping Stone

The same structured training data (query → results → clicks → conversions) is formatted to be compatible with **Google Vertex AI Ranking API** and **Recommendation AI**. When volume justifies it, eComplete can switch from local Ollama reranking to Vertex AI real-time ranking with no data pipeline changes — only the inference endpoint changes.

### Cost Model

| Approach | Cost per query | Latency | Control |
|---|---|---|---|
| OpenAI / Claude API | ~$0.002–0.01 | 200–800ms | None (data leaves VPC) |
| Ollama local (GPU Spot) | ~$0.00003 (amortised) | 50–200ms | Full (data stays local) |
| Vertex AI Ranking API | ~$0.001 | 30–100ms | Partial |

Local first, Vertex when scale demands it. No OpenAI/Anthropic API calls in production inference paths.

---

## Phase Plan

| Phase | What | Status | Dependencies |
|---|---|---|---|
| **Done** | Shopify Base Theme — all 13 native features | DONE | — |
| **Done** | Theme Builder admin UI + job API (Lambda) | DONE | — |
| **Done** | Auth Lambda (login, getMe, listUsers) | DONE | — |
| **Done** | Admin wizard — 18 features, 6 categories | DONE | — |
| **Done** | CORS fix | DONE | — |
| **Done** | eComplete Search (pepSearch) — live on pepkor.ecomplete.co.za | DONE | — |
| **Done** | Wishlist backend (DynamoDB + Lambda) | DONE | — |
| **Phase 1** | Wishlist enterprise — named lists, sharing, analytics | In progress | ecomplete-api packages/core |
| **Phase 1** | Upsell module — rules, tracking, revenue dashboard | In progress | ecomplete-api packages/upsell |
| **Phase 1** | eComplete Search — AI enhancements (semantic, visual, autocomplete) | In progress | Ollama embeddings |
| **Phase 2** | Loyalty program (tiers, points, referrals, gamification) | Planned | Shopify Functions |
| **Phase 2** | Shopify Apps — package all 4 modules as App Store apps | Planned | Modules complete |
| **Phase 3** | Upsell Shopify Checkout Extension + Post-purchase Extension | Planned | Shopify Checkout Extensions |
| **Phase 4** | Magento 2 base theme (ground-up, Alpine.js + Tailwind) | Planned | Separate project |
| **Phase 4** | Magento 2 modules — Search, Wishlist, Upsell, Loyalty | Planned | M2 base theme + CB modules |
| **Phase 4** | Admin UI platform selector (Shopify / M2 / WooCommerce) | Planned | After M2 base theme |
| **Phase 5** | WooCommerce base theme (FSE + Tailwind + Alpine.js) | Planned | After M2 proves pattern |
| **Phase 5** | WooCommerce plugins — Search, Wishlist, Upsell, Loyalty | Planned | WC base theme + CB modules |
| **Phase 5** | Platform-specific Ollama models (magento-coder, woocommerce-coder) | Planned | Training data from builds |
| **Ongoing** | Commerce Bridge API integration | Ongoing | As modules become available |

---

## TODO: Build from URL (Website Cloner)

**Goal:** The primary build input — paste a live website URL and the platform analyses the existing site to generate a new theme that matches it. Figma becomes the optional secondary input for when a design file exists.

### How it works

```
Step 0: Platform → Shopify / Magento / WooCommerce / WordPress
Step 1: Source   → Website URL (primary)  OR  Figma URL (optional)
                    ↓                          ↓
              Puppeteer crawl              Figma API
              screenshot + styles          frame export
                    ↓                          ↓
              Visual analysis (shopify-visual-coder)
                    ↓
              Design tokens (colours, fonts, spacing, sections)
                    ↓
              Build theme from tokens
```

### What the URL crawler needs to capture

| Data | How |
|---|---|
| Full-page screenshots (home, collection, product, cart, search) | Puppeteer `page.screenshot({ fullPage: true })` |
| Computed CSS styles (fonts, colours, spacing) | `window.getComputedStyle()` on key selectors |
| Section/component inventory | DOM analysis — what sections exist, their order, layout |
| Logo + brand assets | Extract from `<img>`, `<svg>`, favicon, OG image |
| Typography scale | Extract all font-family, font-size, font-weight, line-height, letter-spacing |
| Colour palette | Extract all unique colours from computed styles |
| Navigation structure | Parse `<nav>`, `<header>` link structure |
| Product card layout | Analyse product grid structure (columns, card content, aspect ratios) |
| Footer structure | Parse footer columns, links, content |

### Architecture

```
Admin wizard Step 1 (new tab: "From URL")
  → POST /jobs with { sourceType: 'url', sourceUrl: 'https://example.com' }
  → Job runner Phase 3 (analyse):
      if sourceType === 'url':
        → Puppeteer crawls 5 pages (/, /collections/all, /products/*, /cart, /search)
        → Screenshots + computed styles extracted
        → shopify-visual-coder analyses screenshots
        → Same VisualAnalysis output as Figma path
      else:
        → Figma API path (existing)
  → Rest of pipeline unchanged (build → deploy → QA)
```

### New files needed

| File | Purpose |
|---|---|
| `packages/job-runner/src/crawl.ts` | Puppeteer crawler — screenshots, computed styles, DOM analysis |
| `packages/job-runner/src/url-analyse.ts` | Feed screenshots to vision model, extract design tokens |
| `packages/admin/src/pages/NewJobPage.tsx` | Add "From URL" tab in Step 1 alongside Figma |
| `packages/core/src/types/index.ts` | Add `sourceType: 'figma' \| 'url'` + `sourceUrl` to CreateJobRequest |

### Use cases

- **Competitor cloning** — "Build me a store that looks like this competitor"
- **Platform migration** — "Move this Magento store to Shopify" (crawl M2, build Shopify)
- **Redesign reference** — "Use this site as inspiration for the new design"
- **No Figma available** — client has a live site but no design file

### Priority

Medium — build after the current modules are deployed and tested. The Puppeteer infrastructure already exists in the QA runner (`qa-runner/src/browser.ts`) and the vision model analysis exists in `job-runner/src/analyse.ts`. This is mainly a new entry point, not a new pipeline.

---

## eComplete Search — Current State (pepSearch)

**Repo:** `ecomplete/pepSearch`
**Live on:** `ecompleteplus.myshopify.com`
**Status:** Production — "please be aware of changing things in here as it will break live"

**What it has:**
- Shopify app (Remix + Prisma + Vite)
- NLP query parsing (metafield extraction, stop words)
- Product indexer service
- In-memory search cache (TTL-based)
- `do-search` theme app extension (blocks + assets)
- Domain mappings (multi-store support)
- App proxy at `/apps/PepSearch`
- Scopes: `read_products`, `write_themes`
- Webhooks: `app/scopes_update`, `app/uninstalled` + GDPR compliance

**What needs doing:**
1. Strip Groq API credentials (replace with Ollama or remove)
2. Rebrand PepSearch → eComplete Search (app name, extension, proxy path)
3. Add AI capabilities (semantic search, visual search via Ollama)
4. Add analytics dashboard
5. Integrate with base theme (replace native Shopify predictive search)
6. Extract search API for multi-platform use
