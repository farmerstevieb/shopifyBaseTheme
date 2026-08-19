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

// Shopify's Admin API throttles under sustained load (e.g. the whole team
// pushing/creating branch themes against the same store at once) and the
// CLI itself doesn't retry theme commands on that -- it just surfaces a bare
// "Throttled" error box. Retry with backoff instead of letting a transient
// rate limit crash the whole command. Only applies when output was actually
// captured (the default): a caller that opted into `stdio: "inherit"` for a
// live progress bar has no captured output to inspect, so this rethrows
// immediately there, same as before -- no behavior change for those calls.
const MAX_THROTTLE_RETRIES = 5;

function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, ms);
}

function withThrottleRetry(run) {
  for (let attempt = 1; ; attempt++) {
    try {
      return run();
    } catch (err) {
      const output = `${err.stdout || ""}${err.stderr || ""}`;
      if (/\bThrottled\b/.test(output) && attempt < MAX_THROTTLE_RETRIES) {
        const delayMs = Math.min(2000 * 2 ** (attempt - 1), 30000) + Math.floor(Math.random() * 1000);
        console.error(`→ Rate limited by Shopify — retrying in ${Math.round(delayMs / 1000)}s (attempt ${attempt}/${MAX_THROTTLE_RETRIES})...`);
        sleepSync(delayMs);
        continue;
      }
      throw err;
    }
  }
}

function shopify(args, options = {}) {
  ensureDistDirExists();
  return withThrottleRetry(() =>
    execFileSync(process.execPath, [SHOPIFY_ENTRY, ...args], { encoding: "utf8", ...options }),
  );
}

function shopifySpawn(args, options = {}) {
  ensureDistDirExists();
  return spawn(process.execPath, [SHOPIFY_ENTRY, ...args], options);
}

// Shopify CLI's background update-notifier ("checked-for-available-upgrade",
// once per day) can print a "Version X available!" notice on stdout after a
// command's own --json output, on top of it being a generic CLI-wide hook
// with no guarantee it stays quiet for every command/version forever. Rather
// than assume the whole of stdout is pure JSON, extract just the first
// complete JSON value and ignore anything appended after it.
function parseJsonOutput(out) {
  const start = out.search(/[[{]/);
  if (start === -1) throw new Error(`No JSON found in CLI output:\n${out.slice(0, 300)}`);
  const open = out[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < out.length; i++) {
    const ch = out[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) return JSON.parse(out.slice(start, i + 1));
    }
  }
  throw new Error(`Unterminated JSON in CLI output:\n${out.slice(0, 300)}`);
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
  const themes = parseJsonOutput(out);
  return themes.find((t) => t.name === name);
}

function findLiveTheme() {
  const out = shopify(["theme", "list", "-e", "local", "--json"]);
  const themes = parseJsonOutput(out);
  return themes.find((t) => t.role === "live");
}

// A branch name can coincidentally match a live theme's name -- callers that
// write to (theme-dev/push) or repoint local source at (theme-pull) whatever
// theme the branch name resolves to must not silently land on production.
// Read-only settings bootstrapping (theme-pull-settings.js) already has its
// own deliberate "pull from live" fallback and is unaffected by this -- it
// calls findTheme directly, not this guard.
function assertNotLive(theme, name) {
  if (theme && theme.role === "live") {
    console.error(`✗ "${name}" resolves to the LIVE published theme (#${theme.id}) — refusing to use it here.`);
    console.error("  Your local branch name happens to match a Shopify theme name that is currently live.");
    console.error("  To deploy to production, use `npm run promote` instead.");
    process.exit(1);
  }
}

// Every client clone's shopify.theme.toml has its own [environments.local]
// store -- some CLI calls (e.g. a `theme pull` into a throwaway tmp dir
// outside the project) can't rely on `-e local` to resolve it themselves
// (the CLI resolves an environment's config relative to --path, so a
// --path outside the project can't find shopify.theme.toml at all) and need
// the store domain directly. Read it from the same config file everything
// else already trusts, instead of hardcoding a client's domain anywhere.
function readLocalStore() {
  const tomlPath = path.resolve(__dirname, "../../shopify.theme.toml");
  const content = fs.readFileSync(tomlPath, "utf8");
  const match = content.match(/\[environments\.local\][^[]*?^store\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error(`Could not find [environments.local] store in ${tomlPath}`);
  }
  return match[1];
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
  const result = parseJsonOutput(out);
  console.log(`✓ Created theme "${result.theme.name}" (#${result.theme.id})`);
  return { id: result.theme.id, justCreated: true };
}

module.exports = {
  shopify,
  shopifySpawn,
  getBranchThemeName,
  findTheme,
  findLiveTheme,
  ensureThemeExists,
  parseJsonOutput,
  withThrottleRetry,
  assertNotLive,
  readLocalStore,
};
