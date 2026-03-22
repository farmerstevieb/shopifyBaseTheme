# eComplete Platform — Product Overview

> Shareable overview for the eComplete team. Last updated: March 2026.

---

## What Is the eComplete Platform?

eComplete is an AI-powered theme building and e-commerce module platform. It takes a Figma design file and a store handle, then automatically generates, builds, and deploys a fully configured theme in approximately 15 minutes — with zero manual code. On top of that, it provides a suite of enterprise e-commerce modules (Search, Wishlist, Upsell, Loyalty) that work across all major platforms via a single API, without requiring third-party app installs. The platform is designed to be white-labelled, resold, and used as the foundation for any new client e-commerce project.

---

## Theme Builder

**Admin UI:** [d1d3aksfd7p614.cloudfront.net](https://d1d3aksfd7p614.cloudfront.net)

The Theme Builder is a 5-step wizard in the admin UI. You paste a Figma file URL, enter a store handle, pick which features to include, review the AI-extracted design preview, then hit Build. The platform:

1. Downloads the Figma frames as images
2. Runs a vision model to extract brand colours, typography, and section layout
3. Generates all theme files (settings, templates, CSS, Liquid)
4. Deploys to the store as an unpublished preview theme
5. Runs an automated QA loop (Puppeteer + vision model) — up to 3 passes to catch layout issues, font 404s, and colour mismatches before a human reviews it

The result is a theme that is approximately 80–85% production-ready. A developer spends 2–4 hours of QA and polishing rather than 30–40 hours building from scratch.

### Admin Wizard — 18 Features Across 6 Categories

The wizard supports feature selection grouped into:

| Category | Features |
|---|---|
| Navigation | Mega menu, mobile drawer nav |
| Commerce | Wishlist, Back-in-stock alerts, Gift card template |
| Content | FAQ accordion, About page, Rich text editor |
| Marketing | Newsletter popup, Cookie consent, Age verification |
| UX | Compare products, Infinite scroll, Recently viewed |
| Merchandising | Countdown timer, Product badges, Testimonials, Size guide |

---

## Base Themes

### Shopify Base Theme

A production-ready, white-label Shopify OS2.0 theme built from the ground up. Stack: Webpack, TypeScript, TailwindCSS v3, SCSS, React 19 (Radix UI). It includes 13+ native features with zero third-party app dependencies — wishlist, back-in-stock, compare, cookie consent, age verification, newsletter popup, countdown timer, testimonials, infinite scroll, and more.

Client projects use the base theme as a git submodule with a thin overlay (brand colours, fonts, CSS overrides) applied via a merge script. This means every client benefits from base theme improvements automatically.

**Repo:** `ecomplete/ecomplete-shopify-base`

### Magento 2 Base Theme

A ground-up Magento 2 theme — not a Hyvä fork, which means zero licence cost and full IP ownership. Same tech stack as the Shopify base: Alpine.js + Tailwind CSS + Vite. Covers the full Magento module surface: catalog, cart, checkout, customer account, CMS, multi-store, MSI, GraphQL. Ready for extension compatibility (Amasty, MagePlaza, Mageworx, Elasticsearch).

**Repo:** `ecomplete/ecomplete-magento-base`

---

## Module Suite

All four modules are API-first, headless, and platform-agnostic. They work on any Shopify store (via theme snippets or Shopify app), any Magento 2 store (via module), any WooCommerce store (via plugin), and any custom frontend (via the external API). No app install required for the core functionality — the API is the product.

### Search

AI-powered product search for any e-commerce store. Features: NLP query parsing, semantic search via local Ollama embeddings, visual search (upload an image, match to catalogue), AI autocomplete, typo tolerance with fuzzy matching and AI reranking, zero-results handling, and a full analytics dashboard showing search terms, click-through rates, and conversion. Self-learning: every search interaction feeds back into the training pipeline.

**Live on:** ecompleteplus.myshopify.com

### Wishlist

Enterprise wishlist — a direct competitor to Swym. Features: multiple named lists per customer, shareable list links (link, email, social), price-drop alerts, back-in-stock alerts, guest-to-customer sync (localStorage + API merge on login), social proof ("X people saved this"), and a full analytics dashboard. AI-powered recommendations from wishlist data (collaborative filtering via local Ollama). Multi-store and multi-currency supported out of the box.

**Backend:** Complete (DynamoDB + Lambda + Express). **Theme UI:** Built for Shopify. WooCommerce and Magento 2 versions in progress.

### Upsell

Intelligent upsell and cross-sell across the full purchase journey. Features: cart upsell drawer (slides out after Add to Cart), "Complete the look" PDP section, "Frequently bought together" (AI-analysed order history), checkout upsell (Shopify Checkout UI Extension), post-purchase one-click add, progressive discount counters ("Add 2 more for 15% off"), time-limited offers with countdown timers, A/B testing, and a revenue attribution dashboard. Manual rules via admin + AI-generated bundles from purchase pattern analysis.

### Loyalty

A full loyalty and rewards program — a direct competitor to Smile.io and LoyaltyLion. Features: points per spend, action points (review, share, signup, birthday), fully configurable tier system (Bronze through Platinum), tier perks (multipliers, free shipping, early access, VIP collections), dual-reward referral program, points redemption at checkout (Shopify Function), gamification (challenges, streaks, bonus events), expiring points, multi-store shared points pool, and a complete admin dashboard for configuring tiers, rules, and campaigns. AI-powered: churn prediction and optimal reward timing via local Ollama analysis.

---

## Platform Coverage Matrix

| Module | Shopify Theme | Shopify App | Magento 2 | WooCommerce |
|---|---|---|---|---|
| Search | Snippet | Published app | Module | Plugin |
| Wishlist | Snippet | Published app | Module | Plugin |
| Upsell | Snippet | Published app | Module | Plugin |
| Loyalty | Snippet | Published app | Module | Plugin |

Shopify stores without the full Theme Builder get the modules via the published Shopify apps. Magento 2 and WooCommerce stores install the native module/plugin. The API backend is shared across all platforms.

---

## AI — Local Models, Self-Learning, GA4

All AI inference runs on local Ollama models — zero per-token cost, all data stays within the infrastructure. No OpenAI or external AI API calls in any production inference path.

### Models

| Model | Purpose |
|---|---|
| `ecomplete-search-base` | Intent classification, query rewriting, result reranking for Search |
| `shopify-coder` | Theme code generation (Liquid, CSS, section schemas, template JSON) |
| `shopify-visual-coder` | Figma frame analysis, QA screenshot comparison, visual diff reporting |

### Self-Learning

The search model improves continuously. GA4 search events (queries, clicks, add-to-cart, zero-results) flow into a DynamoDB training table. A training pipeline exports approved examples as fine-tune datasets, runs LoRA fine-tuning on the local GPU, and promotes improved checkpoints — all without any external training cost or data leaving the infrastructure.

The same structured data is formatted to be compatible with Google Vertex AI Ranking API, so the platform can switch from local Ollama inference to Vertex AI at scale with no pipeline changes.

### GA4 Integration

GA4 click and conversion data feeds directly into the search training loop. Every interaction on every connected store improves the next model checkpoint.

---

## What's Live Now

| Component | Status |
|---|---|
| Shopify Base Theme | Production-ready, in use on Hydraulics |
| Theme Builder admin UI | Built and deployed at d1d3aksfd7p614.cloudfront.net |
| Search app (ecompleteSearch) | Live on ecompleteplus.myshopify.com and pepkor.ecomplete.co.za |
| Wishlist backend | Complete (DynamoDB + Lambda) |
| Wishlist theme UI (Shopify) | Built |
| Back-in-stock backend and UI | Complete |

## Coming Soon

| Component | Status |
|---|---|
| Wishlist — named lists, sharing, analytics | In progress |
| Upsell module (rules, tracking, analytics) | Planned — Phase 2 |
| Loyalty program (tiers, points, referrals) | Planned — Phase 3 |
| Magento 2 base theme | Planned — Phase 4 |
| WooCommerce base theme | Planned — Phase 5 |
| Shopify Apps (all 4 modules) | Planned |
| Magento 2 modules (all 4) | Planned |
| WooCommerce plugins (all 4) | Planned |
| Admin UI platform selector (Shopify/M2/WC) | Planned — after M2 theme |
| Platform-specific AI models (magento-coder, woocommerce-coder) | Future |

---

## Repos (eComplete Org)

| Repo | Purpose |
|---|---|
| `ecomplete/ecomplete-api` | Theme Builder platform — admin UI, job API, all module backends |
| `ecomplete/ecomplete-shopify-base` | Shopify base theme |
| `ecomplete/ecomplete-magento-base` | Magento 2 base theme |
| `ecomplete/ecomplete-search` | Search app (Shopify, Remix + Prisma + MySQL) |
| `ecomplete/module-search-magento2` | Magento 2 Search module |
| `ecomplete/module-wishlist-magento2` | Magento 2 Wishlist module |
| `ecomplete/module-upsell-magento2` | Magento 2 Upsell module |
| `ecomplete/module-loyalty-magento2` | Magento 2 Loyalty module |
| `ecomplete/cb-search-app` | eComplete Search — Shopify App (App Store ready) |
| `ecomplete/cb-wishlist-app` | eComplete Wishlist — Shopify App (App Store ready) |
| `ecomplete/cb-upsell-app` | eComplete Upsell — Shopify App (App Store ready) |
| `ecomplete/cb-loyalty-app` | eComplete Loyalty — Shopify App (App Store ready) |
| `ecomplete/cb-search-woo` | eComplete Search — WooCommerce Plugin |
| `ecomplete/cb-wishlist-woo` | eComplete Wishlist — WooCommerce Plugin |
| `ecomplete/cb-upsell-woo` | eComplete Upsell — WooCommerce Plugin |
| `ecomplete/cb-loyalty-woo` | eComplete Loyalty — WooCommerce Plugin |
