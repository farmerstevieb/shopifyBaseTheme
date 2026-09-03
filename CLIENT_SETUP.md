# New Client Setup Checklist

Use this checklist every time you spin up a new client project from this base theme.

The base theme is never edited directly for a client build. A client project is its own repo — this base is pulled in as a **git submodule**, and your client-specific work lives entirely in a `shopify/` overlay directory that sits alongside it. `client-scaffold/` in this repo is the starting point for that new repo; it's not something you run from here.

---

## Step 1 — Create the client repo from the scaffold

```bash
# Copy client-scaffold/ out as the new repo's root
cp -r client-scaffold/ ../client-name
cd ../client-name
git init

# Add this base theme as a submodule
git submodule add <this-repo-url> base
```

---

## Step 2 — Configure the store

Edit `package.json`:
- [ ] `"name"`: set to `client-name-stores`

Edit `shopify.theme.toml`:
- [ ] `store`: the client's myshopify.com subdomain (without `.myshopify.com`)

Edit `scripts/dev.js`:
- [ ] `STORE`: same subdomain, with `.myshopify.com`
- [ ] `STAGING_THEME`: the theme ID of an existing staging/reference theme on that store to clone settings from on first run

---

## Step 3 — Build your client overlay

Create a `shopify/` directory at the repo root. Anything you put here **replaces** the matching file from the base theme wholesale when `npm run merge` builds `dist/` — it's a full-file override, not a per-line merge, so only add files you actually want to diverge:

- [ ] `shopify/config/settings_data.json` — brand colours, typography choices, and every other theme setting. These are configured live in the Shopify Theme Editor after your first push, then pulled back into this file to keep them in version control (see Step 6) — you don't hand-edit color hex values here up front.
- [ ] `shopify/assets/` — client font files, logos, any custom CSS/JS
- [ ] `shopify/sections/`, `shopify/snippets/`, `shopify/templates/` — only the specific files you need to diverge from the base
- [ ] `shopify/locales/` — only if overriding specific translation strings

**Custom fonts:** the base's `shopify/snippets/theme/_head.liquid` embeds eComplete's own licensed typeface — that's not something a client build reuses. If the client needs a custom typeface, override `_head.liquid` in your `shopify/` overlay with your own `@font-face` blocks and font files in `shopify/assets/`. If using a Shopify Fonts library font instead, no override is needed — just set it via the Theme Editor's Typography settings.

The base theme ships fully app-free — there is nothing to remove for LoyaltyLion, Nosto, TrustPilot, Pandectes, or Klaviyo. Add only the app integrations this specific client actually uses, in your overlay.

---

## Step 4 — Install & build

```bash
npm install
npm run build          # builds base/dist/ + merges your shopify/ overlay into dist/
```

---

## Step 5 — Authenticate with Shopify

```bash
shopify auth login --store client-store

# Verify connection
shopify theme list
```

---

## Step 6 — First dev run & deploy

```bash
npm run dev             # first run: clones STAGING_THEME's settings, pushes an
                         # unpublished personal theme, saves its ID to
                         # .dev-theme-id, and starts hot reload. Subsequent
                         # runs reuse that saved theme.

npm run push             # build + push to the default theme
npm run push:theme -- ID # build + push to a specific theme ID
```

After configuring the theme in the Shopify Theme Editor, pull the settings back into version control:

```bash
shopify theme pull --path dist --only "config/settings_data.json"
cp dist/config/settings_data.json shopify/config/settings_data.json
```

---

## Step 7 — Keeping up with base theme fixes

```bash
npm run update:base     # pulls the latest base theme, rebuilds, re-merges your overlay
```

Core fixes and features land on the base theme's own `main` branch — pull them in with `update:base` rather than reimplementing. Client-specific work stays in your `shopify/` overlay and is never touched by this.

---

## Optional Extras

- [ ] Add the client's GA4 / GTM tag in **Custom scripts** in Theme Settings
- [ ] Configure Shopify Markets if needed
- [ ] Set up metafields for product/customer personalisation
- [ ] Add the client's cookie consent app snippet
