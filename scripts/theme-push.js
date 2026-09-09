const { execFileSync } = require("child_process");
const path = require("path");

const { getBranchThemeName, ensureThemeExists, shopify } = require("./lib/theme-branch");

const root = path.resolve(__dirname, "..");

// A stale or mid-rebuild dist/ (e.g. a concurrent `webpack:dev` watch pass)
// looks locally incomplete, which makes `theme push` try to delete protected
// remote files it thinks are missing. Always push a fresh, complete build.
console.log("→ Building a fresh dist/ before pushing...");
// npm itself is npm.cmd on Windows — shell: true lets PATHEXT resolve it,
// same reasoning as the shopify CLI invocation in lib/theme-branch.js.
execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });

const branch = getBranchThemeName();
const { id: themeId, justCreated } = ensureThemeExists(branch);

// ensureThemeExists already pushed dist/ as part of creating the theme —
// pushing again immediately after would be redundant and can hit the
// brand-new theme while Shopify is still finishing processing it.
if (!justCreated) {
  console.log(`→ Pushing dist/ to theme "${branch}" (#${themeId})...`);
  shopify(["theme", "push", "-e", "local", "--path", "dist", "--theme", String(themeId)], { stdio: "inherit" });
}
