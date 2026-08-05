const { execFileSync } = require("child_process");
const path = require("path");
const readline = require("readline");

const { shopify, findLiveTheme, parseJsonOutput } = require("./lib/theme-branch");

const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function dateStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Piped (non-TTY) stdin makes readline/promises' `await rl.question(...)`
// silently lose an answer when a second question is asked right after —
// the underlying stream fires its 'line' event before the next question()
// call re-registers a listener, and that line is simply dropped. Chaining
// through plain callbacks instead (no await boundary between prompts) is
// the pattern that reliably works for both a real terminal and piped input
// (needed for --dry-run to be scriptable/testable at all).
function promptSequence(rl, liveTheme, backupName, newThemeName) {
  return new Promise((resolve) => {
    rl.question("Your name (for the promotion log): ", (nameAnswer) => {
      const promoterName = nameAnswer.trim();
      if (!promoterName) {
        resolve({ promoterName: null, confirmed: false });
        return;
      }

      console.log(`
About to promote main to production on spitz-development.myshopify.com:
  1. Duplicate current live theme "${liveTheme.name}" (#${liveTheme.id}) as "${backupName}"
  2. Build main fresh
  3. Push that build as a new theme "${newThemeName}"
  4. Publish "${newThemeName}" as the live theme
  Promoted by: ${promoterName}
`);
      rl.question('Type "yes" to proceed: ', (confirmAnswer) => {
        resolve({ promoterName, confirmed: confirmAnswer.trim().toLowerCase() === "yes" });
      });
    });
  });
}

async function main() {
  if (dryRun) console.log("── DRY RUN — no theme will actually be duplicated, built, or published ──\n");

  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== "main") {
    console.error(`✗ Run this from main, after your PR is merged via GitHub — currently on "${branch}".`);
    process.exitCode = 1;
    return;
  }

  if (git(["status", "--porcelain"]) !== "") {
    console.error("✗ Working tree isn't clean — commit, stash, or discard changes before promoting.");
    process.exitCode = 1;
    return;
  }

  git(["fetch", "origin", "main"]);
  const local = git(["rev-parse", "HEAD"]);
  const remote = git(["rev-parse", "origin/main"]);
  if (local !== remote) {
    console.error("✗ main isn't up to date with origin/main — run `git pull` first.");
    process.exitCode = 1;
    return;
  }

  const liveTheme = findLiveTheme();
  if (!liveTheme) {
    console.error('✗ Couldn\'t find a theme with role "live" on the store.');
    process.exitCode = 1;
    return;
  }

  const stamp = dateStamp();
  const backupName = `Production backup — ${liveTheme.name} — ${stamp}`;
  const newThemeName = `Production | ${stamp}`;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const { promoterName, confirmed } = await promptSequence(rl, liveTheme, backupName, newThemeName);
  rl.close();

  if (!promoterName) {
    console.error("✗ A name is required.");
    process.exitCode = 1;
    return;
  }

  if (!confirmed) {
    console.log("Aborted — nothing was changed.");
    return;
  }

  if (dryRun) {
    console.log("\n✓ Dry run complete — all guards and confirmation passed. Nothing was actually promoted.");
    return;
  }

  console.log(`\n→ Duplicating "${liveTheme.name}" as backup...`);
  const dupOut = shopify([
    "theme", "duplicate", "-e", "local",
    "--theme", String(liveTheme.id),
    "--name", backupName,
    "--force", "--json",
  ]);
  const backupTheme = parseJsonOutput(dupOut).theme;
  console.log(`✓ Backup theme "${backupTheme.name}" (#${backupTheme.id}) created — rollback with:`);
  console.log(`  shopify theme publish -e local --theme ${backupTheme.id} --force`);

  console.log("\n→ Building main fresh...");
  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });

  console.log(`\n→ Pushing build as new theme "${newThemeName}"...`);
  const pushOut = shopify([
    "theme", "push", "-e", "local", "--path", "dist",
    "--unpublished", "--theme", newThemeName, "--json",
  ]);
  const newTheme = parseJsonOutput(pushOut).theme;
  console.log(`✓ Pushed "${newTheme.name}" (#${newTheme.id})`);

  console.log(`\n→ Publishing "${newTheme.name}" as the live theme...`);
  shopify(["theme", "publish", "-e", "local", "--theme", String(newTheme.id), "--force"], { stdio: "inherit" });

  console.log(`\n✓ Promoted by ${promoterName} at ${stamp}.`);
  console.log(`  Live: "${newTheme.name}" (#${newTheme.id})`);
  console.log(`  Rollback: shopify theme publish -e local --theme ${backupTheme.id} --force`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
