const fs = require("fs");
const path = require("path");

const { getBranchThemeName, findTheme, assertNotLive, shopify } = require("./lib/theme-branch");

// Pulls only the JSON files a merchant/theme-editor could plausibly have changed
// (settings, template section content, locale overrides) — never liquid/scss/ts
// source or compiled assets, which git already owns and a raw pull would clobber
// with build output.
const ONLY_PATTERN = "*/*.json";

const branch = getBranchThemeName();
const theme = findTheme(branch);
if (!theme) {
  console.error(`✗ No theme named "${branch}" exists yet — run "npm run dev" first.`);
  process.exit(1);
}
assertNotLive(theme, branch);

const syncDir = path.resolve(__dirname, "../__sync");
const shopifyDir = path.resolve(__dirname, "../shopify");

fs.rmSync(syncDir, { recursive: true, force: true });
fs.mkdirSync(syncDir);

console.log(`→ Pulling JSON changes from theme "${branch}" (#${theme.id})...`);
shopify(["theme", "pull", "-e", "local", "--path", syncDir, "--theme", String(theme.id), "--only", ONLY_PATTERN], {
  stdio: "inherit",
});

fs.cpSync(syncDir, shopifyDir, { recursive: true });
fs.rmSync(syncDir, { recursive: true, force: true });

console.log("✓ Merged into shopify/. Review with `git diff` and commit what you want to keep.");
