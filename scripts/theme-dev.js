const { getBranchThemeName, ensureThemeExists, shopifySpawn } = require("./lib/theme-branch");

const branch = getBranchThemeName();
ensureThemeExists(branch);

console.log(`→ Starting live dev session on theme "${branch}"...`);

// --theme-editor-sync: without it, edits made in the Shopify Theme Editor
// while this session is running are never pulled back down -- local stays
// the sole source of truth and can silently clobber them on the next
// upload. Safe to enable given predev/prebuild pulls settings from the
// branch's own theme instead of always from live (see
// scripts/theme-pull-settings.js) -- local and remote should usually
// already agree at startup, so the CLI's interactive "Reconciliation
// Strategy" prompt (triggered when they don't) should be rare rather than
// the norm. If it does show up, it's asking whether to keep the local or
// remote version of specific JSON files -- answer based on which side has
// the change you actually want to keep.
const child = shopifySpawn(
  ["theme", "dev", "-e", "local", "--theme", branch, "--theme-editor-sync", ...process.argv.slice(2)],
  { stdio: "inherit" },
);

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
