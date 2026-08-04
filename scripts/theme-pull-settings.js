const { getBranchThemeName, findTheme, shopify } = require("./lib/theme-branch");

// Pulling from --live unconditionally on every build/dev start overwrites
// any settings/template JSON already accumulated on the branch's own theme
// (e.g. from someone editing it in the Theme Editor) with whatever's on the
// published theme instead -- discarding real branch progress every restart.
// Pull from the branch's own theme once it exists; only fall back to the
// live theme to bootstrap a brand-new branch that doesn't have one yet.
const branch = getBranchThemeName();
const theme = findTheme(branch);

if (theme) {
  console.log(`→ Pulling settings from theme "${branch}" (#${theme.id})...`);
  shopify(["theme", "pull", "-e", "local", "--path", "./shopify", "--theme", String(theme.id), "--only", "*/*.json", "--nodelete"], {
    stdio: "inherit",
  });
} else {
  console.log(`→ No theme named "${branch}" yet — bootstrapping settings from the live theme...`);
  shopify(["theme", "pull", "-e", "local", "--path", "./shopify", "--live", "--only", "*/*.json", "--nodelete"], {
    stdio: "inherit",
  });
}
