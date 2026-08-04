const { execFileSync } = require("child_process");
const path = require("path");
const readline = require("readline");

const { shopify, findTheme } = require("./lib/theme-branch");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const explicitBranch = args.find((a) => !a.startsWith("--"));

function git(gitArgs) {
  return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8" }).trim();
}

// Single prompt, so no risk of the piped-stdin double-question bug found
// in theme-promote.js (only bites when a second question follows an await
// gap) — but kept as a plain callback for consistency and to stay testable
// via piped input either way.
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "yes");
    });
  });
}

async function main() {
  if (dryRun) console.log("── DRY RUN — nothing will actually be deleted ──\n");

  const branch = explicitBranch || git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch === "HEAD") {
    console.error("✗ Not on a branch (detached HEAD) — pass a branch name explicitly.");
    process.exitCode = 1;
    return;
  }
  if (branch === "main" || branch === "master") {
    console.error(`✗ Refusing to clean up "${branch}" — that's not a per-branch preview theme.`);
    process.exitCode = 1;
    return;
  }

  git(["fetch", "origin", "main"]);
  const merged = (() => {
    try {
      git(["merge-base", "--is-ancestor", branch, "origin/main"]);
      return true;
    } catch {
      return false;
    }
  })();
  if (!merged && !force) {
    console.error(
      `✗ "${branch}" doesn't appear to be merged into main yet — refusing to delete its theme/branch.\n` +
        "  Pass --force if you're sure (e.g. it was merged via squash/rebase, which this check can't see).",
    );
    process.exitCode = 1;
    return;
  }

  const theme = findTheme(branch);

  console.log(`
About to clean up branch "${branch}":
  - Theme: ${theme ? `delete "${theme.name}" (#${theme.id}, ${theme.role})` : "none found — nothing to delete"}
  - Local branch: delete "${branch}"
  - Remote branch: delete "origin/${branch}"
`);
  const proceed = dryRun || (await confirm('Type "yes" to proceed: '));
  if (!proceed) {
    console.log("Aborted — nothing was changed.");
    return;
  }
  if (dryRun) {
    console.log("\n✓ Dry run complete — nothing was actually deleted.");
    return;
  }

  if (theme) {
    console.log(`\n→ Deleting theme "${theme.name}" (#${theme.id})...`);
    shopify(["theme", "delete", "-e", "local", "--theme", String(theme.id), "--force"], { stdio: "inherit" });
  }

  const currentBranch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (currentBranch === branch) {
    console.log("\n→ Switching off the branch being deleted...");
    git(["checkout", "main"]);
  }

  console.log(`\n→ Deleting local branch "${branch}"...`);
  git(["branch", force ? "-D" : "-d", branch]);

  console.log(`→ Deleting remote branch "origin/${branch}"...`);
  execFileSync("git", ["push", "origin", "--delete", branch], { cwd: root, stdio: "inherit" });

  console.log(`\n✓ Cleaned up "${branch}".`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
