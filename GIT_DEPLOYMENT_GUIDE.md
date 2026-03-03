# IMA Base Theme — Git & Deployment Guide

Everything you need to manage the base theme, create client projects, and deploy to Shopify.

---

## Architecture Overview

```
ima-base-theme (GitHub)          ← This repo — the upstream base
       │
       ├── client-remi-cachet    ← Per-client repo (cloned from base)
       ├── client-additional-lengths
       └── client-new-brand      ← New client: clone → customise → deploy
```

**Key principle:** The base theme is the upstream. Client repos are forks. Core improvements flow downstream; client-specific changes stay in their own repos.

---

## Part 1: GitHub Setup (One-Time)

### 1.1 — Create the base theme as a GitHub Template Repository

1. Push this repo to GitHub:
   ```bash
   cd /path/to/shopifyBaseTheme
   git remote add origin git@github.com:ima-agency/ima-base-theme.git
   git push -u origin main
   ```

2. On GitHub → repo settings → **"Template repository"** ✓ (enable this toggle)

   This lets you create new client repos from the template in one click — with a clean git history, no fork relationship cluttering things.

### 1.2 — Protect the main branch

GitHub → Settings → Branches → Add rule for `main`:
- ✓ Require pull request reviews before merging
- ✓ Require status checks to pass (add linting CI later)
- ✓ Restrict who can push to matching branches

### 1.3 — Recommended repo naming convention

```
ima-agency/ima-base-theme           ← base (template)
ima-agency/client-remi-cachet       ← client repo
ima-agency/client-additional-lengths
ima-agency/client-acme-brand
```

---

## Part 2: Creating a New Client Project

### 2.1 — From GitHub (recommended)

1. Go to `github.com/ima-agency/ima-base-theme`
2. Click **"Use this template"** → **"Create a new repository"**
3. Name it `client-{brand-name}`, set to **Private**
4. Clone it locally:
   ```bash
   git clone git@github.com:ima-agency/client-brand-name.git
   cd client-brand-name
   ```

### 2.2 — From CLI (alternative)

```bash
# Clone base as new project (clean history)
git clone git@github.com:ima-agency/ima-base-theme.git client-brand-name
cd client-brand-name

# Point to new remote (client repo on GitHub)
git remote set-url origin git@github.com:ima-agency/client-brand-name.git
git push -u origin main
```

### 2.3 — Do the CLIENT_SETUP.md checklist

Follow every step in `CLIENT_SETUP.md`. Key changes:
- `shopify.theme.toml` — store name
- `tailwind.config.js` — brand colours
- `shopify/config/settings_schema.json` — theme defaults, colours, fonts
- Add font files to `shopify/assets/` if custom typeface
- Remove unused app integrations

---

## Part 3: Shopify CLI — Day-to-Day Development

### Prerequisites

```bash
# Install Shopify CLI (once per machine)
npm install -g @shopify/cli

# Install project dependencies
pnpm install

# Authenticate
shopify auth login --store your-store-name
```

### Development workflow

```bash
# Start hot-reload dev server (builds + watches + syncs to Shopify dev theme)
pnpm dev

# Build only (no watch, no Shopify sync)
pnpm build

# Push built files to Shopify (creates a new dev theme if none exists)
shopify theme push --development --path ./dist

# Push to a specific theme by ID
shopify theme push --theme THEME_ID --path ./dist

# List themes on the store
shopify theme list

# Pull settings JSON from Shopify (keep settings_data.json up to date)
pnpm run shopify:sync
```

### Environments

| Environment | Use for | Command |
|---|---|---|
| `local` | Active development | `pnpm dev` |
| `staging` | Client review / UAT | `shopify theme push -e staging` |
| `production` | Go-live | `shopify theme push -e production` |

> **Tip:** Never push directly to the live/published theme during active development. Always use a separate development or staging theme.

---

## Part 4: Branching Strategy

### Per-client branch structure

```
main          ← production-ready, matches live theme
├── staging   ← staging environment
└── dev       ← active development

feature/loyalty-tier-ui     ← feature branches off dev
fix/cart-drawer-mobile
```

### Workflow for new features

```bash
# Start a feature
git checkout dev
git pull origin dev
git checkout -b feature/loyalty-tier-ui

# ... do work ...

git add -p          # stage changes selectively
git commit -m "feat: add tier badge to account drawer"

# Push and open PR → dev
git push origin feature/loyalty-tier-ui
# → Open PR on GitHub: feature branch → dev
```

### Release to production

```bash
# Merge dev → staging, deploy to staging theme, get client sign-off
git checkout staging
git merge dev
git push origin staging
shopify theme push -e staging --path ./dist

# After sign-off: merge staging → main, deploy to live
git checkout main
git merge staging
git push origin main
shopify theme push -e production --path ./dist
```

---

## Part 5: Pulling Base Theme Updates Into a Client Repo

When you improve the base theme (new component, bug fix, etc.) and want to propagate it to client repos:

### 5.1 — Add base theme as upstream remote (one-time per client repo)

```bash
cd client-brand-name
git remote add upstream git@github.com:ima-agency/ima-base-theme.git
git fetch upstream
```

### 5.2 — Merge upstream changes

```bash
# Always merge into dev, never directly into main
git checkout dev
git fetch upstream
git merge upstream/main --no-ff

# Resolve any conflicts (usually in tailwind.config.js, settings_schema.json)
# These are the files you customised — just keep client values

git push origin dev
```

### 5.3 — What will and won't conflict

**Will likely conflict (client-specific, resolve manually):**
- `tailwind.config.js` — brand colours
- `shopify/config/settings_schema.json` — theme defaults
- `shopify/snippets/theme/_head.liquid` — font declarations
- `shopify.theme.toml` — store config

**Should merge cleanly:**
- New/updated sections (`shopify/sections/*.liquid`)
- New/updated snippets
- JS/TS module improvements (`src/js/main/`)
- New SCSS components
- Build tooling updates (`package.json`, webpack config)

---

## Part 6: What You Need — Full Stack

### Per-developer machine

| Tool | Purpose | Install |
|---|---|---|
| Node.js ≥ 22 | Build tooling | `nvm install 22` |
| pnpm | Package manager | `npm i -g pnpm` |
| Shopify CLI | Theme push/dev | `npm i -g @shopify/cli` |
| Git | Version control | Built-in or `brew install git` |

### Per-project / per-client

| Thing | Where | Notes |
|---|---|---|
| GitHub repo | `github.com/ima-agency/client-*` | Private repo, created from template |
| Shopify store access | Shopify Partner Dashboard | Add as staff or use Partner access |
| Development theme | Auto-created on first push | Separate from live theme |
| Staging theme | Create manually in Shopify admin | Name it "Staging" |

### Shopify account setup

1. **Shopify Partner account** — gives you access to all client stores without needing to be billed
2. **Staff account on each store** — or use Partner collaborator access
3. **Theme permissions** — ensure your account has "Themes" permission

### Recommended additional tooling

| Tool | Why | Link |
|---|---|---|
| GitHub Actions | CI/CD — auto-lint on PR, auto-deploy on merge | Free for private repos |
| Shopify GitHub integration | Auto-deploy from GitHub to Shopify | In Shopify Admin → Online Store → Themes |
| Figma | Design handoff | Standard |
| Linear or Notion | Project/task tracking per client | Your choice |

---

## Part 7: CI/CD with GitHub Actions (Optional but Recommended)

Create `.github/workflows/deploy.yml` in each client repo:

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

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Deploy to Shopify
        uses: shopify/shopify-cli-action@v1
        with:
          cli_command: theme push --path ./dist --theme ${{ github.ref == 'refs/heads/main' && secrets.PRODUCTION_THEME_ID || secrets.STAGING_THEME_ID }}
        env:
          SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_CLI_THEME_TOKEN }}
          SHOPIFY_FLAG_STORE: ${{ secrets.SHOPIFY_STORE }}
```

Add these **GitHub Secrets** to each client repo:
- `SHOPIFY_STORE` — `your-store.myshopify.com`
- `SHOPIFY_CLI_THEME_TOKEN` — from Shopify Admin → Apps → develop apps → create private app with Theme token
- `STAGING_THEME_ID` — theme ID from Shopify
- `PRODUCTION_THEME_ID` — theme ID from Shopify

---

## Part 8: Settings Data & Version Control

`shopify/config/settings_data.json` is the live configuration of all theme settings (colours, fonts, content). This needs careful management:

**Strategy:**
- Commit a "clean default" `settings_data.json` in the base template (all defaults, no real content)
- After initial client setup, commit the client's configured `settings_data.json` once
- Use `pnpm run shopify:sync` to pull the latest settings back down after editor changes

**Warning:** Never blindly overwrite `settings_data.json` from another environment — it contains real content/config that could clobber client changes.

---

## Quick Reference — Common Commands

```bash
# New client from scratch
git clone git@github.com:ima-agency/ima-base-theme.git client-name && cd client-name
pnpm install
# → edit shopify.theme.toml, tailwind.config.js, settings_schema.json
pnpm dev

# Daily dev
pnpm dev                                        # hot-reload
git add -p && git commit -m "..."               # commit
git push origin feature/my-feature             # push branch

# Deploy
pnpm build && shopify theme push -e staging --path ./dist   # staging
pnpm build && shopify theme push -e production --path ./dist # production

# Pull base theme updates
git fetch upstream && git merge upstream/main   # into dev branch

# Sync settings from Shopify
pnpm run shopify:sync
```
