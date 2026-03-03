# New Client Setup Checklist

Use this checklist every time you spin up a new client project from this base theme.

---

## Step 1 — Clone & Rename

```bash
# On GitHub: create a new repo from the ima-base-theme template
# Then clone it locally:
git clone git@github.com:ima-agency/client-name.git
cd client-name
```

---

## Step 2 — Configure the Store

Edit `shopify.theme.toml`:
- [ ] Replace `your-store-name` with the client's myshopify.com subdomain

---

## Step 3 — Brand Colours

Edit `tailwind.config.js`:
- [ ] Update `brand.1` through `brand.accent2` with client hex values
- [ ] OR leave as CSS vars and set defaults in `shopify/config/settings_schema.json`

Edit `shopify/config/settings_schema.json`:
- [ ] Update `theme_info` name and author
- [ ] Update default colour values in the **Colors** section
- [ ] Update default font selections in the **Typography** section

---

## Step 4 — Fonts

If the client has a custom typeface:
- [ ] Add `.woff` and `.woff2` font files to `shopify/assets/`
- [ ] Add `@font-face` blocks in `shopify/snippets/theme/_head.liquid`
- [ ] Update `fontFamily.body` and/or `fontFamily.heading` in `tailwind.config.js`

If using Shopify's font library:
- [ ] Set the font in `settings_schema.json` Typography defaults
- [ ] No font files needed — Shopify serves them from `fonts.shopifycdn.com`

---

## Step 5 — Remove Unused App Integrations

Check which apps the client uses and remove the rest:

- [ ] **LoyaltyLion** — If not used: remove `shopify/snippets/loyalty/`, remove `loyalty-page.liquid`, remove `page.rewards.json`
- [ ] **Nosto** — If not used: remove `shopify/snippets/nosto/`, remove nosto sections/templates, remove `src/js/main/nosto-templates/`, remove `src/js/main/nosto-predictive-search/`
- [ ] **TrustPilot** — If not used: remove `shopify/sections/trustpilot.liquid`, `snippets/trustpilot-business-stats.liquid`, `src/js/main/trustpilot/`
- [ ] **Pandectes** — If not used: remove `shopify/snippets/pandectes-rules.liquid` and the render call in `layout/theme.liquid`
- [ ] **Klaviyo** — If not used: remove `src/js/main/klaviyo/`

---

## Step 6 — Markets / Regions

- [ ] If single market: delete all `.context.gb.json`, `.context.eu.json`, `.context.us.json` files
- [ ] If multi-market: update each context file with correct region-specific content

---

## Step 7 — Install & Build

```bash
pnpm install
pnpm build
```

---

## Step 8 — Authenticate with Shopify

```bash
# Log in to Shopify CLI
shopify auth login --store your-store-name

# Verify connection
shopify theme list
```

---

## Step 9 — First Deploy

```bash
# Push to a development theme (creates a new one if no theme ID)
shopify theme push --development --store your-store-name --path ./dist

# Or dev mode (hot-reload)
pnpm dev
```

---

## Step 10 — Update settings_data.json

After first push, configure the theme in the Shopify Theme Editor, then:
```bash
# Pull back the settings to keep them in version control
pnpm run shopify:sync
```

---

## Optional Extras

- [ ] Add the client's GA4 / GTM tag in **Custom scripts** in Theme Settings
- [ ] Configure Shopify Markets if needed
- [ ] Set up metafields for product/customer personalisation
- [ ] Add the client's cookie consent app snippet
