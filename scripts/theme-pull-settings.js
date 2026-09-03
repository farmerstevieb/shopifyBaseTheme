const { getBranchThemeName, findTheme, shopify } = require("./lib/theme-branch");

// Pulling from --live unconditionally on every build/dev start overwrites
// any settings/template JSON already accumulated on the branch's own theme
// (e.g. from someone editing it in the Theme Editor) with whatever's on the
// published theme instead -- discarding real branch progress every restart.
// Pull from the branch's own theme once it exists; only fall back to the
// live theme to bootstrap a brand-new branch that doesn't have one yet.
//
// config/settings_schema.json is deliberately excluded from every pull here.
// It's the theme's *definition* of what settings exist (authored in git,
// reviewed like any other source file) -- not runtime data. settings_data.json
// (the actual configured *values*) is the one that legitimately needs to
// live-sync with whatever a merchant/PM changed in the theme editor.
// Pulling the schema too meant every build silently overwrote a real,
// hand-authored settings_schema.json with whatever happened to be live on
// the store -- Shopify's own Dawn default on a fresh/never-customized store.
// That's exactly how this file ended up permanently reverted to Dawn's
// schema here, undetected, until a live "theme cannot be previewed" 422
// surfaced it.
const PULL_ONLY = "*/*.json";
const PULL_IGNORE = "config/settings_schema.json";

const branch = getBranchThemeName();
const theme = findTheme(branch);

if (theme) {
  console.log(`→ Pulling settings from theme "${branch}" (#${theme.id})...`);
  shopify(["theme", "pull", "-e", "local", "--path", "./shopify", "--theme", String(theme.id), "--only", PULL_ONLY, "--ignore", PULL_IGNORE, "--nodelete"], {
    stdio: "inherit",
  });
} else {
  console.log(`→ No theme named "${branch}" yet — bootstrapping settings from the live theme...`);
  shopify(["theme", "pull", "-e", "local", "--path", "./shopify", "--live", "--only", PULL_ONLY, "--ignore", PULL_IGNORE, "--nodelete"], {
    stdio: "inherit",
  });
}
