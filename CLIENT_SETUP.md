# New Client Setup Checklist

Use this checklist every time you spin up a new client project from this base theme.

A client project is a full, independent fork of this repo — its own copy of everything (`scripts/`, `src/`, `shopify/`), not a submodule or overlay. Client-specific work happens directly in the client's own copy of `shopify/`; base theme fixes are pulled in later via `git fetch`/`merge` from this repo as an upstream remote (see Step 7).

`client-scaffold/` also exists in this repo as a lighter-weight submodule+overlay starting point, but it isn't what real client projects (Fair Price, Spitz) actually run on — this checklist follows the proven full-fork pattern those use.

---

## Step 1 — Clone & rename

```bash
# Clone this base as the new client repo (clean history is fine to keep --
# it's how base fixes get pulled in later, see Step 7)
git clone git@github.com:ecomplete/ecomplete-shopify-base.git client-name
cd client-name

# Point origin at the new client repo instead
git remote rename origin base
git remote add origin git@github.com:ecomplete/client-name.git
git push -u origin main
```

---

## Step 2 — Configure the store

Edit `shopify.theme.toml` (gitignored once populated — copy from `shopify.theme.toml.example` if it doesn't exist yet):
- [ ] `[environments.local].store` — the client's myshopify.com subdomain (without `.myshopify.com`)
- [ ] Uncomment and fill in `[environments.staging]`/`[environments.production]` if this client needs the `npm run promote:staging`/`promote:main` workflow (see Step 6) — same store value on both for a single-store client, different stores for a two-store setup

---

## Step 3 — Brand & settings

- [ ] `shopify/config/settings_schema.json` — update `theme_info` name/author for this client
- [ ] Everything else (brand colours, typography, favicon, etc.) is configured live in the Shopify Theme Editor after your first push, then pulled back into `shopify/config/settings_data.json` to keep it in version control — see Step 6. Don't hand-edit colour hex values in the schema up front.

**Custom fonts:** the base's `shopify/snippets/theme/_head.liquid` embeds eComplete's own licensed typeface — that's not something a client build reuses. If this client needs a custom typeface, replace those `@font-face` blocks with the client's own and add the font files to `shopify/assets/`. If using a Shopify Fonts library font instead, no code change is needed — just set it via the Theme Editor's Typography settings.

The base theme ships fully app-free — there is nothing to remove for LoyaltyLion, Nosto, TrustPilot, Pandectes, or Klaviyo. Add only the app integrations this specific client actually uses.

---

## Step 4 — Install & build

```bash
npm install
npm run build
```

---

## Step 5 — Authenticate with Shopify

```bash
shopify auth login --store client-store

# Verify connection
shopify theme list -e local
```

---

## Step 6 — Dev & deploy

```bash
npm run dev              # hot-reload dev server against [environments.local]
npm run theme:push       # build + push
npm run theme:pull       # pull changes made in the Theme Editor back down
npm run shopify:sync     # pull + push just the *.json settings files, keeps
                          # settings_data.json in version control after
                          # editor changes
```

If `[environments.staging]`/`[environments.production]` are configured in Step 2:

```bash
npm run promote:staging  # build + push to staging (single-store: an
                          # unpublished theme on the same store; two-store:
                          # a full separate development store)
npm run promote:main     # build + push to production, after staging sign-off
```

---

## Step 7 — Pulling base theme fixes into this client repo

```bash
git fetch base
git merge base/main --no-ff
```

The `base` remote is whichever this-repo clone you forked from in Step 1 (rename it `upstream` if you prefer). Most changes merge cleanly — sections, snippets, JS/SCSS modules, build tooling. `shopify/config/settings_schema.json` and anything you've customised in `shopify/sections/` or `shopify/snippets/` may conflict; keep this client's values, but check the incoming diff carefully rather than blindly picking a side — base fixes sometimes land inside a file you've also changed, and a plain "take mine" resolution can silently drop the base fix. Two things worth knowing from experience doing this kind of merge on this exact codebase:

- Git's 3-way merge can silently drop an inserted line (e.g. a closing `{% endif %}`) if it lands next to unchanged context, without ever flagging a conflict. After resolving, verify Liquid tag balance in any file you touched rather than trusting a clean `git status`.
- Shopify Liquid has no parentheses for grouping boolean expressions — `{% if a and (b or c) %}` is invalid syntax. Use nested `if`/`unless` instead.

Run `shopify theme check --path shopify` after resolving, and compare its error/warning count against the pre-merge baseline rather than just checking it's zero — some warnings are pre-existing and unrelated.

---

## Optional Extras

- [ ] Add the client's GA4 / GTM tag in **Custom scripts** in Theme Settings
- [ ] Configure Shopify Markets if needed
- [ ] Set up metafields for product/customer personalisation
- [ ] Add the client's cookie consent app snippet
