const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");

const { shopify, findTheme, findLiveTheme, ensureThemeExists, assertNotLive, parseJsonOutput, normalizeJson, readEnvironment } = require("./lib/theme-branch");

const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

// Two ways a client's shopify.theme.toml can be set up, detected from the
// [environments.staging] / [environments.production] store values rather
// than a separate config flag, so there's only one place to get this right:
//
//   - Different stores ("two-store" mode): staging gets its own full
//     duplicate-backup / build / push / publish cycle on its own store,
//     exactly like production does on its own. Full isolation, but apps,
//     metaobjects/metafields, and file/asset references are NOT portable
//     between the two stores as-is -- installing the same app fresh on the
//     other store gets a different block-type UUID, metaobject definitions
//     live in Admin data rather than git, and shopify://... file references
//     only resolve if a same-named file was uploaded to THAT store too.
//     Reconciling those is a manual step when standing up the second store,
//     not something this script does automatically.
//
//   - Same store ("single-store" mode): staging pushes into a persistent
//     UNPUBLISHED theme on the same store production is live on, reviewed
//     via its preview link -- never duplicated, never published. This
//     avoids the portability problems above entirely (apps, metaobjects,
//     files, and the product catalog are store-wide, not per-theme), at the
//     cost of no real isolation: staging shares the same customer/catalog/
//     app-install data as production. The only real risk becomes "did
//     someone publish the staging theme by mistake" -- guarded by
//     assertNotLive, same guard this repo's other branch-theme scripts
//     already rely on.
function resolveTarget() {
  const arg = process.argv.find((a) => a.startsWith("--target="));
  const name = arg && arg.slice("--target=".length);
  if (name !== "staging" && name !== "main") {
    console.error("✗ Missing/invalid --target — run this via `npm run promote:staging` or `npm run promote:main`, not directly.");
    process.exit(1);
  }

  const staging = readEnvironment("staging");
  const production = readEnvironment("production");
  if (!production || !production.store) {
    console.error("✗ No [environments.production] configured in shopify.theme.toml.");
    console.error("  Uncomment that block and fill in the production store domain before promote can run.");
    process.exit(1);
  }
  if (!staging || !staging.store) {
    console.error("✗ No [environments.staging] configured in shopify.theme.toml.");
    console.error("  Uncomment that block and fill in a store domain (the same as production for single-store mode, or a separate one) before promote can run.");
    process.exit(1);
  }

  const singleStore = staging.store === production.store;
  if (name === "main") {
    return { name: "main", branch: "main", store: production.store, mode: "live" };
  }
  return {
    name: "staging",
    branch: "staging",
    store: staging.store,
    mode: singleStore ? "unpublished-theme" : "live",
    themeName: staging.theme || "Staging",
  };
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function dateStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Each successful promote tags the commit it shipped (promoted/<target>/
// <stamp>), so the next promote can find exactly which merged PRs are newly
// included. Namespaced per target so a staging promote never mistakes a
// production tag (or vice versa) for its own prior baseline -- the two
// branches diverge and get promoted independently.
function previousPromoteTag(target) {
  try {
    return git(["describe", "--tags", "--match", `promoted/${target.name}/*`, "--abbrev=0"]);
  } catch {
    return null; // no prior tracked promotion -- nothing to diff against yet
  }
}

// Reads first-parent merge commits only, so a PR's own internal commits
// don't get mistaken for separate merges. Handles both a regular merge
// commit and a squash merge (GitHub suffixes "(#N)" onto the title).
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

function walkJsonFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(full, base, out);
    else if (entry.name.endsWith(".json")) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

// Compares theme's current settings/template JSON against what git had at
// the last promotion for this target -- anything different was changed
// directly in the theme editor since then, not through a PR, and is about
// to be silently overwritten by this promote's git-only build. Works the
// same for both modes: `theme` is the live theme in live mode, or the
// persistent staging theme in single-store mode -- either way it's "the
// theme this promote is about to overwrite".
function checkLiveDrift(theme, prevTag, target) {
  if (!prevTag) return { driftedFiles: [], tmpDir: null };

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "promote-drift-"));
  // Not `-e <name>`: that environment's config is resolved relative to
  // --path, so pointing --path outside the project (a throwaway tmp dir)
  // makes the CLI unable to find shopify.theme.toml at all. --store
  // directly sidesteps that.
  shopify(["theme", "pull", "--store", target.store, "--path", tmpDir, "--theme", String(theme.id), "--only", "*/*.json", "--nodelete"]);
  const driftedFiles = [];
  for (const relPath of walkJsonFiles(tmpDir)) {
    const liveContent = fs.readFileSync(path.join(tmpDir, relPath), "utf8");
    let baseline;
    try {
      baseline = git(["show", `${prevTag}:shopify/${relPath}`]);
    } catch {
      continue; // didn't exist at the last promotion -- new since then via git, not a drift concern
    }
    try {
      if (normalizeJson(liveContent) !== normalizeJson(baseline)) driftedFiles.push(relPath);
    } catch {
      if (liveContent.trim() !== baseline.trim()) driftedFiles.push(relPath); // unparsable -- fall back to raw compare
    }
  }
  return { driftedFiles, tmpDir };
}

// Commits the drifted files' actual live content onto a fresh branch and
// opens a PR into the target branch, so a direct theme-editor edit gets
// captured in git instead of relying on someone remembering to do it by
// hand after the fact.
function openDriftSyncPr(driftedFiles, tmpDir, stamp, target) {
  const branchName = `sync/live-drift-${target.name}-${stamp.replace(/[: ]/g, "-")}`;
  try {
    git(["checkout", "-b", branchName]);
    for (const relPath of driftedFiles) {
      const dest = path.join(root, "shopify", relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(tmpDir, relPath), dest);
    }
    git(["add", ...driftedFiles.map((f) => `shopify/${f}`)]);
    git([
      "commit", "-m",
      `Sync live-theme edits found during ${target.name} ${stamp} promote\n\nDetected by npm run promote:${target.name}'s drift check -- these files were edited directly in the theme editor since the last tracked promotion, not through a PR. Captured as-is from the live theme so the edit isn't lost.`,
    ]);
    git(["push", "-u", "origin", branchName]);

    const prBody = `Detected by \`npm run promote:${target.name}\`'s live-drift check, before overwriting them.\n\nThese files were edited directly in the Shopify theme editor (on ${target.store}) since the last tracked promotion, not through a PR:\n\n${driftedFiles.map((f) => `- \`${f}\``).join("\n")}\n\nReview and merge into \`${target.branch}\` to make these edits permanent -- otherwise the next promote will overwrite them again.`;
    return execFileSync(
      "gh",
      ["pr", "create", "--base", target.branch, "--head", branchName, "--title", `Sync live-theme edits found during ${target.name} ${stamp} promote`, "--body", prBody],
      { cwd: root, encoding: "utf8" },
    ).trim();
  } catch (err) {
    console.error(`  ✗ Couldn't open the live-drift sync PR: ${err.message}`);
    return null;
  } finally {
    git(["checkout", target.branch]);
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
const CHANGELOG_HEADER = "# Changelog\n\nPromotions, newest first.\n";

function prependChangelogEntry({ stamp, promoterName, prNumbers, newTheme, rollback, target }) {
  const prLines = prNumbers.length
    ? prNumbers.map((n) => `  - #${n}${prTitle(n) ? `: ${prTitle(n)}` : ""}`).join("\n")
    : "  - (no merged PRs found since the last tracked promotion)";
  const entry = `\n## ${stamp} — ${promoterName} (${target.name})\n\n- Theme: "${newTheme.name}" (#${newTheme.id}) on ${target.store}\n- Rollback: ${rollback}\n- PRs included:\n${prLines}\n`;

  const existing = fs.existsSync(CHANGELOG_PATH) ? fs.readFileSync(CHANGELOG_PATH, "utf8") : CHANGELOG_HEADER;
  const body = existing.startsWith(CHANGELOG_HEADER) ? existing.slice(CHANGELOG_HEADER.length) : `\n${existing}`;
  fs.writeFileSync(CHANGELOG_PATH, CHANGELOG_HEADER + entry + body);
}

// Piped (non-TTY) stdin makes readline/promises' `await rl.question(...)`
// silently lose an answer when a second question is asked right after —
// the underlying stream fires its 'line' event before the next question()
// call re-registers a listener. Chaining through plain callbacks instead
// (no await boundary between prompts) is the pattern that reliably works
// for both a real terminal and piped input.
function confirmSequence(rl, message) {
  return new Promise((resolve) => {
    rl.question("Your name (for the promotion log): ", (nameAnswer) => {
      const promoterName = nameAnswer.trim();
      if (!promoterName) {
        resolve({ promoterName: null, confirmed: false });
        return;
      }
      console.log(`\n${message}\n  Promoted by: ${promoterName}\n`);
      rl.question('Type "yes" to proceed: ', (confirmAnswer) => {
        resolve({ promoterName, confirmed: confirmAnswer.trim().toLowerCase() === "yes" });
      });
    });
  });
}

async function confirmOverwrite(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(question, (a) => {
      rl.close();
      resolve(a.trim().toLowerCase());
    });
  });
  return answer;
}

// Builds, pushes via `pushArgs`, and returns the parsed --json response.
// Shared by both modes -- `theme push` validates each file's schema and
// silently drops any file that fails, while still reporting the overall
// push as a success. The --json response is the only place that surfaces
// it (a `warning` string plus a per-file `errors` map) -- this is exactly
// how a broken schema default went missing from a promoted theme for days
// on the Spitz build until someone happened to check the live site.
function buildAndPush(pushArgs) {
  console.log("\n→ Building fresh...");
  execFileSync("npm", ["run", "webpack:build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });

  console.log("\n→ Pushing build...");
  const out = shopify(pushArgs);
  return parseJsonOutput(out);
}

async function handlePushErrors(newTheme) {
  if (!newTheme.errors || !Object.keys(newTheme.errors).length) return true;
  console.log(`\n⚠ ${Object.keys(newTheme.errors).length} file(s) were rejected by Shopify during push and are missing from this build, even though the push itself "succeeded":`);
  for (const [file, errors] of Object.entries(newTheme.errors)) {
    console.log(`    ${file}`);
    for (const msg of errors) console.log(`      ${msg}`);
  }
  console.log("Proceeding now ships without these files -- likely a broken or missing section on whatever page(s) use them.");
  const answer = await confirmOverwrite('Type "publish anyway" to continue despite the missing file(s), anything else to abort: ');
  return answer === "publish anyway";
}

async function recordPromotion({ target, stamp, promoterName, prevTag, newTheme, rollback }) {
  console.log("\n→ Recording this promotion...");
  const prNumbers = mergedPrNumbersSince(prevTag);

  if (prNumbers.length) {
    console.log(`  Commenting on ${prNumbers.length} merged PR(s): ${prNumbers.map((n) => `#${n}`).join(", ")}`);
    for (const num of prNumbers) {
      try {
        execFileSync(
          "gh",
          ["pr", "comment", num, "--body", `Promoted to ${target.name} (${target.store}) by ${promoterName} at ${stamp}.\nTheme: "${newTheme.name}" (#${newTheme.id})\nRollback: ${rollback}`],
          { cwd: root, stdio: "inherit" },
        );
      } catch (err) {
        console.error(`  ✗ Failed to comment on PR #${num}: ${err.message}`);
      }
    }
  } else {
    console.log("  No merged PRs found since the last tracked promotion — skipping PR comments.");
  }

  const tagName = `promoted/${target.name}/${stamp.replace(/[: ]/g, "-")}`;
  try {
    git(["tag", tagName]);
    git(["push", "origin", tagName]);
    console.log(`  Tagged this promotion as ${tagName} for next time.`);
  } catch (err) {
    console.error(`  ✗ Couldn't create/push tag ${tagName}: ${err.message}`);
    console.error(`    git tag ${tagName} && git push origin ${tagName}`);
  }

  prependChangelogEntry({ stamp, promoterName, prNumbers, newTheme, rollback, target });
  try {
    git(["add", "CHANGELOG.md"]);
    git(["commit", "-m", `Record ${target.name} ${stamp} promotion in CHANGELOG`]);
    git(["push", "origin", `HEAD:${target.branch}`]);
    console.log(`  CHANGELOG.md updated and pushed directly to ${target.branch}.`);
  } catch (err) {
    console.error(`  ✗ Couldn't push the CHANGELOG update directly (likely branch protection): ${err.message}`);
    console.error("  CHANGELOG.md has been updated locally — commit it via a normal PR.");
  }
}

// === live mode: full duplicate-backup / build / push-to-new-theme /
// publish cycle. Used by production always, and by staging too when it has
// its own separate store (two-store mode). ===
async function runLiveMode(target, stamp) {
  const liveTheme = findLiveTheme(["--store", target.store]);
  if (!liveTheme) {
    console.error(`✗ Couldn't find a theme with role "live" on ${target.store}.`);
    process.exitCode = 1;
    return;
  }

  const backupName = `${target.name} backup — ${liveTheme.name} — ${stamp}`;
  const newThemeName = `${target.name === "main" ? "Production" : "Staging"} | ${stamp}`;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const { promoterName, confirmed } = await confirmSequence(
    rl,
    `About to promote ${target.branch} to ${target.name} on ${target.store}:\n  1. Duplicate current live theme "${liveTheme.name}" (#${liveTheme.id}) as "${backupName}"\n  2. Build ${target.branch} fresh\n  3. Push that build as a new theme "${newThemeName}"\n  4. Publish "${newThemeName}" as the live theme`,
  );
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
  const dupOut = shopify(["theme", "duplicate", "--store", target.store, "--theme", String(liveTheme.id), "--name", backupName, "--force", "--json"]);
  const backupTheme = parseJsonOutput(dupOut).theme;
  const rollback = `shopify theme publish --store ${target.store} --theme ${backupTheme.id} --force`;
  console.log(`✓ Backup theme "${backupTheme.name}" (#${backupTheme.id}) created — rollback with:\n  ${rollback}`);

  // Deliberately `webpack:build`, not a settings-pulling `build` -- that
  // would silently discard any settings_data.json / templates JSON change a
  // merged PR just committed, replacing it with whatever's already live.
  const newTheme = await buildAndPush(["theme", "push", "--store", target.store, "--path", "dist", "--unpublished", "--theme", newThemeName, "--json"]);
  console.log(`✓ Pushed "${newTheme.name}" (#${newTheme.id})`);
  if (!(await handlePushErrors(newTheme))) {
    console.log(`\nAborted before publishing. Fix the file(s) above, then re-run promote. The broken build is still available, unpublished, as "${newTheme.name}" (#${newTheme.id}) if you want to inspect it.`);
    return;
  }

  const prevTag = previousPromoteTag(target);
  console.log("\n→ Checking whether live has changed since the last promotion...");
  const { driftedFiles, tmpDir: driftTmpDir } = checkLiveDrift(liveTheme, prevTag, target);
  if (driftedFiles.length) {
    console.log(`⚠ ${driftedFiles.length} file(s) on the live theme differ from what git had at the last promotion (${prevTag}):`);
    for (const f of driftedFiles) console.log(`    ${f}`);
    console.log("These look like direct theme-editor edits made since then, not something from a PR.");

    console.log("\n→ Opening a PR to capture these live edits in git before they're overwritten...");
    const syncPrUrl = openDriftSyncPr(driftedFiles, driftTmpDir, stamp, target);
    if (syncPrUrl) console.log(`  ${syncPrUrl}`);
    fs.rmSync(driftTmpDir, { recursive: true, force: true });

    console.log(`\nPublishing now overwrites them on live -- they're captured in the PR above${syncPrUrl ? "" : " (though it failed to open -- see error above)"}, and still in backup "${backupTheme.name}" (#${backupTheme.id}) either way.`);
    const answer = await confirmOverwrite('Type "overwrite" to publish anyway, anything else to abort: ');
    if (answer !== "overwrite") {
      console.log(`\nAborted before publishing. The live theme is untouched. Your build is still available, unpublished, as "${newTheme.name}" (#${newTheme.id}) if you want to publish it manually later.`);
      return;
    }
  } else {
    console.log("  No drift found — live matches what git had at the last promotion.");
    if (driftTmpDir) fs.rmSync(driftTmpDir, { recursive: true, force: true });
  }

  console.log(`\n→ Publishing "${newTheme.name}" as the live theme...`);
  shopify(["theme", "publish", "--store", target.store, "--theme", String(newTheme.id), "--force"], { stdio: "inherit" });
  console.log(`\n✓ Promoted by ${promoterName} at ${stamp}.\n  Live: "${newTheme.name}" (#${newTheme.id}) on ${target.store}\n  Rollback: ${rollback}`);

  await recordPromotion({ target, stamp, promoterName, prevTag, newTheme, rollback });
}

// === unpublished-theme mode: staging in single-store setups. Pushes into
// the SAME persistent theme every time -- no duplicate, no publish -- so
// there's always one stable preview link, and no risk of it ever becoming
// what customers see except by someone explicitly publishing it (guarded by
// assertNotLive). ===
async function runUnpublishedThemeMode(target, stamp) {
  const existing = findTheme(target.themeName, ["--store", target.store]);
  assertNotLive(existing, target.themeName);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const { promoterName, confirmed } = await confirmSequence(
    rl,
    `About to promote ${target.branch} to the "${target.themeName}" theme on ${target.store} (single-store staging -- this theme stays unpublished):\n  1. Build ${target.branch} fresh\n  2. Push into "${target.themeName}"${existing ? ` (#${existing.id})` : " (creating it)"}`,
  );
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

  const prevTag = previousPromoteTag(target);
  let driftTmpDir = null;
  // Drift-check BEFORE building/pushing, unlike live mode: there's no
  // separate "old" theme to compare against here -- staging always pushes
  // into the SAME theme, so checking after the push would just compare our
  // own freshly-pushed content against itself and always report zero drift.
  if (existing && prevTag) {
    console.log("\n→ Checking whether the staging theme has changed since the last promotion...");
    const { driftedFiles, tmpDir } = checkLiveDrift(existing, prevTag, target);
    driftTmpDir = tmpDir;
    if (driftedFiles.length) {
      console.log(`⚠ ${driftedFiles.length} file(s) on "${target.themeName}" differ from what git had at the last promotion (${prevTag}):`);
      for (const f of driftedFiles) console.log(`    ${f}`);
      console.log("These look like direct theme-editor edits made since then, not something from a PR.");

      console.log("\n→ Opening a PR to capture these live edits in git before they're overwritten...");
      const syncPrUrl = openDriftSyncPr(driftedFiles, driftTmpDir, stamp, target);
      if (syncPrUrl) console.log(`  ${syncPrUrl}`);
      fs.rmSync(driftTmpDir, { recursive: true, force: true });

      console.log(`\nContinuing now overwrites them${syncPrUrl ? "" : " (though the sync PR failed to open -- see error above)"} -- they're captured in the PR above.`);
      const answer = await confirmOverwrite('Type "overwrite" to continue anyway, anything else to abort: ');
      if (answer !== "overwrite") {
        console.log(`\nAborted. "${target.themeName}" is untouched.`);
        return;
      }
    } else {
      console.log("  No drift found — the staging theme matches what git had at the last promotion.");
      fs.rmSync(driftTmpDir, { recursive: true, force: true });
    }
  }

  const pushArgs = existing
    ? ["theme", "push", "--store", target.store, "--path", "dist", "--theme", String(existing.id), "--json"]
    : ["theme", "push", "--store", target.store, "--path", "dist", "--unpublished", "--theme", target.themeName, "--json"];
  const newTheme = await buildAndPush(pushArgs);
  console.log(`✓ Pushed "${newTheme.name}" (#${newTheme.id})`);
  if (!(await handlePushErrors(newTheme))) {
    console.log("\nAborted before recording this promotion. Fix the file(s) above, then re-run promote:staging.");
    return;
  }

  console.log(`\n✓ Promoted by ${promoterName} at ${stamp}.\n  Preview: "${newTheme.name}" (#${newTheme.id}) on ${target.store} -- unpublished, view via its preview link in the theme library.`);

  await recordPromotion({ target, stamp, promoterName, prevTag, newTheme, rollback: `re-run npm run promote:staging from an earlier commit -- "${target.themeName}" is never published, so there's nothing customer-facing to roll back` });
}

async function main() {
  const target = resolveTarget();
  if (dryRun) console.log("── DRY RUN — no theme will actually be duplicated, built, or published ──\n");

  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== target.branch) {
    console.error(`✗ Run this from ${target.branch}, after your PR is merged via GitHub — currently on "${branch}".`);
    process.exitCode = 1;
    return;
  }

  if (git(["status", "--porcelain"]) !== "") {
    console.error("✗ Working tree isn't clean — commit, stash, or discard changes before promoting.");
    process.exitCode = 1;
    return;
  }

  git(["fetch", "origin", target.branch]);
  const local = git(["rev-parse", "HEAD"]);
  const remote = git(["rev-parse", `origin/${target.branch}`]);
  if (local !== remote) {
    console.error(`✗ ${target.branch} isn't up to date with origin/${target.branch} — run \`git pull\` first.`);
    process.exitCode = 1;
    return;
  }

  const stamp = dateStamp();
  if (target.mode === "live") {
    await runLiveMode(target, stamp);
  } else {
    await runUnpublishedThemeMode(target, stamp);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
