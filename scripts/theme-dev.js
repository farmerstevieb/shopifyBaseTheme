const { getBranchThemeName, ensureThemeExists, shopifySpawn } = require("./lib/theme-branch");

const branch = getBranchThemeName();
const { justCreated } = ensureThemeExists(branch);

// --theme-editor-sync: without it, edits made in the Shopify Theme Editor
// while this session is running are never pulled back down -- local stays
// the sole source of truth and can silently clobber them on the next
// upload. Safe to enable now that predev/prebuild pulls settings from the
// branch's own theme instead of always from live (see
// scripts/theme-pull-settings.js) -- local and remote should usually
// already agree at startup, so the CLI's interactive "Reconciliation
// Strategy" prompt (triggered when they don't) should be rare rather than
// the norm.
//
// That prompt is genuinely dangerous though: for files that exist only
// locally, one of its two choices is "Delete files from the local
// directory" -- picking it deletes your dist/ files to match whatever's on
// the remote theme, which can be badly incomplete (e.g. right after a
// partially-throttled push). This has actually happened on the team. Only
// relevant when attaching to an EXISTING theme (a brand-new one was just
// pushed in full by ensureThemeExists, so there's nothing to reconcile).
if (!justCreated) {
  console.log(`
⚠  If you see "The files listed below are only present locally...":
   Choose "Upload local files to the remote theme".
   Do NOT choose "Delete files from the local directory" -- that wipes
   your local dist/ to match the remote theme, which may be incomplete.
   (dist/ is disposable either way -- if this does happen, \`rm -rf dist\`
   and run \`npm run dev\` again to rebuild it from source, nothing is
   permanently lost.)
`);
}

console.log(`→ Starting live dev session on theme "${branch}"...`);

const child = shopifySpawn(
  ["theme", "dev", "-e", "local", "--theme", branch, "--theme-editor-sync", ...process.argv.slice(2)],
  { stdio: "inherit" },
);

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
