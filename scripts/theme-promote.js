const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");

const { shopify, findLiveTheme, parseJsonOutput, readLocalStore } = require("./lib/theme-branch");

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

// Each successful promote tags the commit it shipped (promoted/<stamp>), so
// the next promote can find exactly which merged PRs are newly included --
// the record of "who promoted this and when" lives as a comment on each of
// those PRs instead of a separate log file nobody would remember to check.
function previousPromoteTag() {
  try {
    return git(["describe", "--tags", "--match", "promoted/*", "--abbrev=0"]);
  } catch {
    return null; // no prior tracked promotion -- nothing to diff against yet
  }
}

// Reads first-parent merge commits only, so a PR's own internal commits
// don't get mistaken for separate merges. Handles both a regular merge
// commit ("Merge pull request #N from ...") and a squash merge, which
// GitHub suffixes onto the commit title as "... (#N)". No prior tag means
// no prior tracked promotion -- there's nothing to diff against, so this
// is the baseline going forward, not "comment on the entire repo history".
function mergedPrNumbersSince(prevTag) {
  if (!prevTag) return [];
  const log = git(["log", `${prevTag}..HEAD`, "--first-parent", "--pretty=%s"]);
  const numbers = new Set();
  for (const line of log.split("\n")) {
    const match = line.match(/Merge pull request #(\d+)/) || line.match(/\(#(\d+)\)\s*$/);
    if (match) numbers.add(match[1]);
  }
  return [...numbers];
}

// Deep-equal via recursively sorted keys -- ignores key order and
// whitespace, which JSON round-tripped through Shopify's storage never
// preserves anyway, so a naive text diff would flag those as "drift" even
// with zero real content change.
function normalizeJson(str) {
  const sortKeys = (val) => {
    if (Array.isArray(val)) return val.map(sortKeys);
    if (val && typeof val === "object") {
      return Object.keys(val)
        .sort()
        .reduce((acc, k) => {
          acc[k] = sortKeys(val[k]);
          return acc;
        }, {});
    }
    return val;
  };
  return JSON.stringify(sortKeys(JSON.parse(str)));
}

function walkJsonFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(full, base, out);
    else if (entry.name.endsWith(".json")) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

// Compares the live theme's current settings/template JSON against what
// git had for those same files at the last promotion (the promoted/<tag>
// commit) -- anything different was changed directly in the theme editor
// since then, not through a PR, and is about to be silently overwritten by
// this promote's git-only build. No prevTag means no baseline to check
// against (first tracked promotion), so there's nothing to compare.
function checkLiveDrift(liveTheme, prevTag) {
  if (!prevTag) return [];

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "promote-drift-"));
  try {
    // Not `-e local`: that environment's config is resolved relative to
    // --path, so pointing --path outside the project (a throwaway tmp dir)
    // makes the CLI unable to find shopify.theme.toml at all. --store
    // directly sidesteps that -- read from the same toml everything else
    // trusts rather than hardcoding a client's domain here.
    shopify(["theme", "pull", "--store", readLocalStore(), "--path", tmpDir, "--theme", String(liveTheme.id), "--only", "*/*.json", "--nodelete"]);
    const drifted = [];
    for (const relPath of walkJsonFiles(tmpDir)) {
      const liveContent = fs.readFileSync(path.join(tmpDir, relPath), "utf8");
      let baseline;
      try {
        baseline = git(["show", `${prevTag}:shopify/${relPath}`]);
      } catch {
        continue; // didn't exist at the last promotion -- new since then via git, not a drift concern
      }
      try {
        if (normalizeJson(liveContent) !== normalizeJson(baseline)) drifted.push(relPath);
      } catch {
        if (liveContent.trim() !== baseline.trim()) drifted.push(relPath); // unparsable -- fall back to raw compare
      }
    }
    return drifted;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function prTitle(number) {
  try {
    return execFileSync("gh", ["pr", "view", number, "--json", "title", "-q", ".title"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const CHANGELOG_PATH = path.join(root, "CHANGELOG.md");
const CHANGELOG_HEADER = "# Changelog\n\nProduction promotions, newest first.\n";

function prependChangelogEntry({ stamp, promoterName, prNumbers, newTheme, backupTheme }) {
  const prLines = prNumbers.length
    ? prNumbers.map((n) => `  - #${n}${prTitle(n) ? `: ${prTitle(n)}` : ""}`).join("\n")
    : "  - (no merged PRs found since the last tracked promotion)";
  const entry = `\n## ${stamp} — ${promoterName}\n\n- Live theme: "${newTheme.name}" (#${newTheme.id})\n- Rollback: \`shopify theme publish --theme ${backupTheme.id} --force\`\n- PRs included:\n${prLines}\n`;

  const existing = fs.existsSync(CHANGELOG_PATH) ? fs.readFileSync(CHANGELOG_PATH, "utf8") : CHANGELOG_HEADER;
  const body = existing.startsWith(CHANGELOG_HEADER) ? existing.slice(CHANGELOG_HEADER.length) : `\n${existing}`;
  fs.writeFileSync(CHANGELOG_PATH, CHANGELOG_HEADER + entry + body);
}

// Piped (non-TTY) stdin makes readline/promises' `await rl.question(...)`
// silently lose an answer when a second question is asked right after —
// the underlying stream fires its 'line' event before the next question()
// call re-registers a listener, and that line is simply dropped. Chaining
// through plain callbacks instead (no await boundary between prompts) is
// the pattern that reliably works for both a real terminal and piped input
// (needed for --dry-run to be scriptable/testable at all).
function promptSequence(rl, store, liveTheme, backupName, newThemeName) {
  return new Promise((resolve) => {
    rl.question("Your name (for the promotion log): ", (nameAnswer) => {
      const promoterName = nameAnswer.trim();
      if (!promoterName) {
        resolve({ promoterName: null, confirmed: false });
        return;
      }

      console.log(`
About to promote main to production on ${store}:
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

  const store = readLocalStore();
  const stamp = dateStamp();
  const backupName = `Production backup — ${liveTheme.name} — ${stamp}`;
  const newThemeName = `Production | ${stamp}`;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const { promoterName, confirmed } = await promptSequence(rl, store, liveTheme, backupName, newThemeName);
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

  // Deliberately `webpack:build`, not `build` -- `build`'s prebuild hook
  // (shopify:pull-settings) pulls the live theme's *current* JSON settings
  // and overwrites shopify/ with them before webpack ever runs. That's fine
  // for local dev, but here it silently discards any settings_data.json /
  // *-group.json / templates JSON change a merged PR just committed,
  // replacing it with whatever's already live -- the exact opposite of what
  // promoting main is supposed to do.
  console.log("\n→ Building main fresh...");
  execFileSync("npm", ["run", "webpack:build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });

  console.log(`\n→ Pushing build as new theme "${newThemeName}"...`);
  const pushOut = shopify([
    "theme", "push", "-e", "local", "--path", "dist",
    "--unpublished", "--theme", newThemeName, "--json",
  ]);
  const newTheme = parseJsonOutput(pushOut).theme;
  console.log(`✓ Pushed "${newTheme.name}" (#${newTheme.id})`);

  const prevTag = previousPromoteTag();

  console.log("\n→ Checking whether live has changed since the last promotion...");
  const driftedFiles = checkLiveDrift(liveTheme, prevTag);
  if (driftedFiles.length) {
    console.log(`⚠ ${driftedFiles.length} file(s) on the live theme differ from what git had at the last promotion (${prevTag}):`);
    for (const f of driftedFiles) console.log(`    ${f}`);
    console.log("These look like direct theme-editor edits made since then, not something from a PR.");
    console.log(`Publishing now overwrites them -- they aren't lost (still in backup "${backupTheme.name}", #${backupTheme.id}), but nobody will be prompted to reconcile them afterward.`);
    const driftRl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const proceed = await new Promise((resolve) => {
      driftRl.question('Type "overwrite" to publish anyway, anything else to abort: ', (answer) => {
        driftRl.close();
        resolve(answer.trim().toLowerCase() === "overwrite");
      });
    });
    if (!proceed) {
      console.log(`\nAborted before publishing. The live theme is untouched. Your build is still available, unpublished, as "${newTheme.name}" (#${newTheme.id}) if you want to publish it manually later.`);
      return;
    }
  } else {
    console.log("  No drift found — live matches what git had at the last promotion.");
  }

  console.log(`\n→ Publishing "${newTheme.name}" as the live theme...`);
  shopify(["theme", "publish", "-e", "local", "--theme", String(newTheme.id), "--force"], { stdio: "inherit" });

  console.log(`\n✓ Promoted by ${promoterName} at ${stamp}.`);
  console.log(`  Live: "${newTheme.name}" (#${newTheme.id})`);
  console.log(`  Rollback: shopify theme publish -e local --theme ${backupTheme.id} --force`);

  console.log("\n→ Recording this promotion...");
  const prNumbers = mergedPrNumbersSince(prevTag);

  if (prNumbers.length) {
    console.log(`  Commenting on ${prNumbers.length} merged PR(s): ${prNumbers.map((n) => `#${n}`).join(", ")}`);
    for (const num of prNumbers) {
      try {
        execFileSync(
          "gh",
          [
            "pr", "comment", num, "--body",
            `Promoted to production by ${promoterName} at ${stamp}.\nLive theme: "${newTheme.name}" (#${newTheme.id})\nRollback: \`shopify theme publish --theme ${backupTheme.id} --force\``,
          ],
          { cwd: root, stdio: "inherit" },
        );
      } catch (err) {
        console.error(`  ✗ Failed to comment on PR #${num}: ${err.message}`);
      }
    }
  } else {
    console.log("  No merged PRs found since the last tracked promotion — skipping PR comments.");
  }

  const tagName = `promoted/${stamp.replace(/[: ]/g, "-")}`;
  try {
    git(["tag", tagName]);
    git(["push", "origin", tagName]);
    console.log(`  Tagged this promotion as ${tagName} for next time.`);
  } catch (err) {
    console.error(`  ✗ Couldn't create/push tag ${tagName}: ${err.message}`);
    console.error("  The next promote will fall back to scanning full history for merged PRs -- tag it manually if that's not wanted:");
    console.error(`    git tag ${tagName} && git push origin ${tagName}`);
  }

  prependChangelogEntry({ stamp, promoterName, prNumbers, newTheme, backupTheme });
  try {
    git(["add", "CHANGELOG.md"]);
    git(["commit", "-m", `Record ${stamp} promotion in CHANGELOG`]);
    git(["push", "origin", "HEAD:main"]);
    console.log("  CHANGELOG.md updated and pushed directly to main.");
  } catch (err) {
    console.error(`  ✗ Couldn't push the CHANGELOG update directly (likely branch protection): ${err.message}`);
    console.error("  CHANGELOG.md has been updated locally — commit it via a normal PR.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
