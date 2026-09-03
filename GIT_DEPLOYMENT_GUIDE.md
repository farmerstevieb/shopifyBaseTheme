# Base Theme — Git & Deployment Guide

Everything you need to manage the base theme, create client projects, and deploy to Shopify.

---

## Architecture Overview

```
ecomplete-shopify-base (GitHub)   ← This repo — the upstream base
       │
       ├── Fair-Price-Shopify     ← Per-client repo (cloned from base)
       ├── Spitz-Theme
       └── client-new-brand       ← New client: clone → customise → deploy
```

**Key principle:** The base theme is the upstream. Client repos are full, independent forks — their own copy of everything, not a submodule or subtree. Core improvements flow downstream via `git fetch`/`merge` from the base repo as an upstream remote; client-specific changes stay in their own repo and are never pushed back upstream automatically.

This base theme itself is dual-published to two orgs for IP separation — `ecomplete/ecomplete-shopify-base` (eComplete branding) and `farmerstevieb/shopifyBaseTheme` (Farm-IT-Ltd branding). The two are kept functionally aligned by hand: the same fixes get ported to both, with only the branding (`theme_info` in `shopify/config/settings_schema.json`, doc/support URLs) deliberately differing. When forking a new client project, fork from whichever of the two matches that client's branding relationship.

---

## Part 1: GitHub Setup (One-Time)

### 1.1 — Protect the main branch

GitHub → Settings → Branches → Add rule for `main`:
- ✓ Require pull request reviews before merging
- ✓ Require status checks to pass (add linting CI later)
- ✓ Restrict who can push to matching branches

### 1.2 — Repo naming convention

Client repos live in the `ecomplete` GitHub org, named after the client:

```
ecomplete/ecomplete-shopify-base    ← base (eComplete branding)
farmerstevieb/shopifyBaseTheme      ← base (Farm-IT-Ltd branding)
ecomplete/Fair-Price-Shopify        ← client repo
ecomplete/Spitz-Theme
ecomplete/client-acme-brand
```

---

## Part 2: Creating a New Client Project

```bash
# Clone this base as the new client repo
git clone git@github.com:ecomplete/ecomplete-shopify-base.git client-brand-name
cd client-brand-name

# Rename the clone's origin so it's available later as an upstream remote,
# then point origin at the actual new client repo
git remote rename origin base
git remote add origin git@github.com:ecomplete/client-brand-name.git
git push -u origin main
```

Then work through `CLIENT_SETUP.md`'s checklist — store config, brand/settings, first build and deploy.

---

## Part 3: Shopify CLI — Day-to-Day Development

### Prerequisites

```bash
# Install Shopify CLI (once per machine)
npm install -g @shopify/cli

# Install project dependencies
npm install

# Authenticate
shopify auth login --store your-store-name
```

### Development workflow

```bash
npm run dev              # hot-reload dev server: webpack watch + shopify theme dev
                          # against [environments.local] in shopify.theme.toml

npm run build             # full production build to dist/, no Shopify sync

npm run theme:push        # build + push
npm run theme:pull        # pull changes made in the Theme Editor back down
npm run theme:cleanup     # remove stale/orphaned dev themes

npm run shopify:sync      # pull + push just the *.json settings files --
                           # the way to keep settings_data.json in version
                           # control after Theme Editor changes

shopify theme list -e local   # list themes on the configured store
```

### Environments

Configured in `shopify.theme.toml` under `[environments.local]`, and optionally `[environments.staging]`/`[environments.production]`:

| Environment | Use for | Command |
|---|---|---|
| `local` | Active development | `npm run dev` / `npm run theme:push` |
| `staging` | Client review / UAT | `npm run promote:staging` |
| `production` | Go-live | `npm run promote:main` |

`promote:staging`/`promote:main` auto-detect single-store vs two-store mode from whether `[environments.staging]` and `[environments.production]` point at the same store or different ones — see the comments in `shopify.theme.toml` for the exact behaviour of each mode. Not every client repo has adopted this split yet (older ones still use a single `promote` script); check that repo's own `package.json` for what's actually available.

> **Tip:** Never push directly to the live/published theme during active development. Always use a separate development or staging theme.

---

## Part 4: Branching Strategy

### Per-client branch structure

```
main       ← production-ready, matches live theme
staging    ← staging environment (where one exists)

feature/loyalty-tier-ui     ← feature branches off main
fix/cart-drawer-mobile
```

There's no separate long-lived `dev` branch in practice — feature/fix branches come off `main` and PR back into it directly.

### Workflow for new features

```bash
git checkout main
git pull origin main
git checkout -b feature/loyalty-tier-ui

# ... do work ...

git add -p          # stage changes selectively
git commit -m "feat: add tier badge to account drawer"

git push origin feature/loyalty-tier-ui
# → Open PR on GitHub: feature branch → main
```

### Release to staging / production

```bash
# Client review
git checkout staging
git merge main
git push origin staging
npm run promote:staging

# After sign-off
npm run promote:main
```

---

## Part 5: Pulling Base Theme Updates Into a Client Repo

When the base theme gets a fix or new component and you want it in a client repo:

### 5.1 — Add the base theme as an upstream remote (one-time per client repo)

```bash
cd client-brand-name
git remote add base git@github.com:ecomplete/ecomplete-shopify-base.git
git fetch base
```

(If the client repo was created per Part 2, this remote already exists.)

### 5.2 — Merge

```bash
git checkout -b chore/pull-base-updates
git fetch base
git merge base/main --no-ff
```

Push, open a PR into `main`, and resolve any conflicts there rather than merging straight into `main` locally — same review discipline as any other change.

### 5.3 — What will and won't conflict, and what to watch for

**Likely to conflict (client-specific, resolve manually rather than blindly picking a side):**
- `shopify/config/settings_schema.json` — theme defaults, `theme_info`
- Any `shopify/sections/` or `shopify/snippets/` file this client has customised
- `shopify.theme.toml` — store config (this file is gitignored once populated on most client repos, so it usually won't conflict at all)

**Should merge cleanly:**
- New/updated sections and snippets the client hasn't touched
- JS/TS module improvements (`src/js/`)
- New SCSS components
- Build tooling updates (`package.json`, `webpack.config.js`, `scripts/`)

**Two things worth knowing from experience doing this exact kind of merge on this codebase:**

- Git's 3-way merge can silently drop an inserted line (e.g. a closing `{% endif %}`) if it lands next to unchanged context, without ever flagging a conflict. After resolving, check Liquid tag balance in any file you touched rather than trusting a clean `git status` — don't assume "no conflict markers" means "nothing was lost."
- Shopify Liquid has no parentheses for grouping boolean expressions — `{% if a and (b or c) %}` is invalid syntax. Use nested `if`/`unless` instead.

Run `shopify theme check --path shopify` after resolving, and compare the error/warning count against a pre-merge baseline rather than just checking it's zero — some warnings are pre-existing and unrelated to your merge.

---

## Part 6: What You Need — Full Stack

### Per-developer machine

| Tool | Purpose | Install |
|---|---|---|
| Node.js ≥ 22 | Build tooling | `nvm install 22` |
| Shopify CLI | Theme push/dev | `npm i -g @shopify/cli` |
| Git | Version control | Built-in or `brew install git` |

### Per-project / per-client

| Thing | Where | Notes |
|---|---|---|
| GitHub repo | `github.com/ecomplete/client-*` | Private repo, cloned from base per Part 2 |
| Shopify store access | Shopify Partner Dashboard | Add as staff or use Partner access |
| Development theme | Auto-created on first `npm run dev` | Separate from live theme |
| Staging theme | Configured via `[environments.staging]` | Unpublished (single-store) or a separate store (two-store) |

### Shopify account setup

1. **Shopify Partner account** — gives you access to all client stores without needing to be billed
2. **Staff account on each store** — or use Partner collaborator access
3. **Theme permissions** — ensure your account has "Themes" permission

### Recommended additional tooling

| Tool | Why | Link |
|---|---|---|
| GitHub Actions | CI/CD — auto-lint on PR, auto-deploy on merge | Free for private repos |
| Figma | Design handoff | Standard |
| Linear or Notion | Project/task tracking per client | Your choice |

---

## Part 7: CI/CD with GitHub Actions (Optional — Not Currently Set Up Anywhere)

No client or base repo currently has this wired up; the workflow below is a starting point, not documentation of an existing pipeline. Create `.github/workflows/deploy.yml` in a client repo if/when you want it:

```yaml
name: Deploy to Shopify

on:
  push:
    branches:
      - main      # Deploy to production theme
      - staging   # Deploy to staging theme

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm install
      - run: npm run build

      - name: Deploy to Shopify
        uses: shopify/shopify-cli-action@v1
        with:
          cli_command: theme push --path ./dist --theme ${{ github.ref == 'refs/heads/main' && secrets.PRODUCTION_THEME_ID || secrets.STAGING_THEME_ID }}
        env:
          SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_CLI_THEME_TOKEN }}
          SHOPIFY_FLAG_STORE: ${{ secrets.SHOPIFY_STORE }}
```

Add these **GitHub Secrets** to the client repo:
- `SHOPIFY_STORE` — `your-store.myshopify.com`
- `SHOPIFY_CLI_THEME_TOKEN` — from Shopify Admin → Apps → develop apps → create private app with Theme token
- `STAGING_THEME_ID` — theme ID from Shopify
- `PRODUCTION_THEME_ID` — theme ID from Shopify

Note this would run in parallel with, not instead of, `npm run promote:staging`/`promote:main` — reconcile which is the actual deploy path before turning this on for a client that already uses the promote scripts, to avoid two different things pushing to the same theme.

---

## Part 8: Settings Data & Version Control

`shopify/config/settings_data.json` is the live configuration of all theme settings (colours, fonts, content). This needs careful management:

**Strategy:**
- The base theme ships a clean default `settings_data.json` — all defaults, no real client content
- After initial client setup, commit the client's configured `settings_data.json` once
- Use `npm run shopify:sync` to pull the latest settings back down after Theme Editor changes

**Warning:** Never blindly overwrite `settings_data.json` from another environment — it contains real content/config that could clobber client changes.

---

## Quick Reference — Common Commands

```bash
# New client from scratch
git clone git@github.com:ecomplete/ecomplete-shopify-base.git client-name && cd client-name
git remote rename origin base
git remote add origin git@github.com:ecomplete/client-name.git
npm install
# → work through CLIENT_SETUP.md
npm run dev

# Daily dev
npm run dev                                     # hot-reload
git add -p && git commit -m "..."               # commit
git push origin feature/my-feature              # push branch

# Deploy
npm run promote:staging   # staging
npm run promote:main      # production

# Pull base theme updates
git fetch base && git merge base/main --no-ff   # into a feature branch, then PR into main

# Sync settings from Shopify
npm run shopify:sync
```
