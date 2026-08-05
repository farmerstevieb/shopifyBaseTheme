const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// node_modules/.bin/shopify isn't a single cross-platform executable: on
// macOS/Linux it's a symlink to the CLI's JS entrypoint (runnable directly
// via its shebang), but on Windows npm generates a .cmd/.ps1/shell-shim
// trio instead, none of which execFileSync/spawn can run with shell: false.
// Running the CLI's actual entrypoint through this same node binary works
// identically on every platform.
function resolveShopifyEntry() {
  const pkgPath = require.resolve("@shopify/cli/package.json");
  const pkg = require(pkgPath);
  const binRelative = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.shopify;
  return path.resolve(path.dirname(pkgPath), binRelative);
}

const SHOPIFY_ENTRY = resolveShopifyEntry();

// shopify.theme.toml's `-e local` environment points --path at ./dist. The
// CLI validates that path exists on disk before running ANY command through
// that environment, even a pure remote read like `theme list` that never
// touches local files. On a fresh clone, predev (theme-pull-settings.js)
// is the very first command to ever run, before anything has built dist/
// -- so without this, every first-ever `npm run dev` fails immediately.
const DIST_DIR = path.resolve(__dirname, "../../dist");
function ensureDistDirExists() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function shopify(args, options = {}) {
  ensureDistDirExists();
  return execFileSync(process.execPath, [SHOPIFY_ENTRY, ...args], { encoding: "utf8", ...options });
}

function shopifySpawn(args, options = {}) {
  ensureDistDirExists();
  return spawn(process.execPath, [SHOPIFY_ENTRY, ...args], options);
}

function getBranchThemeName() {
  const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
  if (branch === "HEAD") {
    console.error("✗ Not on a branch (detached HEAD) — checkout a branch first.");
    process.exit(1);
  }
  return branch;
}

// Deliberately not using `theme list --name <value>` here: the CLI throws
// "No themes ... match the ID or name" instead of returning an empty match
// whenever <value> contains a "/" — which every branch name in this repo's
// own feature/hotfix naming convention does. Fetch the full list and filter
// for an exact match ourselves instead (we need exact matching anyway,
// since --name only ever did a substring match).
function findTheme(name) {
  const out = shopify(["theme", "list", "-e", "local", "--json"]);
  const themes = JSON.parse(out);
  return themes.find((t) => t.name === name);
}

function findLiveTheme() {
  const out = shopify(["theme", "list", "-e", "local", "--json"]);
  const themes = JSON.parse(out);
  return themes.find((t) => t.role === "live");
}

// Creates the theme (unpublished) if it doesn't exist yet, pushing the
// current dist/ as part of creation. Returns { id, justCreated } so callers
// that only need the theme to exist (theme-dev.js) can ignore justCreated,
// while callers that push separately (theme-push.js) can skip pushing again
// right after creation — a second push immediately after can hit the theme
// while Shopify is still finishing processing the brand-new one.
function ensureThemeExists(name) {
  const existing = findTheme(name);
  if (existing) {
    console.log(`✓ Found existing theme "${name}" (#${existing.id}, ${existing.role})`);
    return { id: existing.id, justCreated: false };
  }

  console.log(`→ No theme named "${name}" yet — creating it from dist/...`);
  const out = shopify(["theme", "push", "-e", "local", "--path", "dist", "--unpublished", "--theme", name, "--json"]);
  const result = JSON.parse(out);
  console.log(`✓ Created theme "${result.theme.name}" (#${result.theme.id})`);
  return { id: result.theme.id, justCreated: true };
}

module.exports = { shopify, shopifySpawn, getBranchThemeName, findTheme, findLiveTheme, ensureThemeExists };
