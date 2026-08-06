/**
 * merge.js
 *
 * Copies shopify/ -> dist/ directly, without a full webpack recompile.
 * Same semantics as the CopyWebpackPlugin step in webpack.config.js (JSON
 * /* comment *\/ header stripping, .DS_Store ignored) -- this is that same
 * copy, exposed standalone for fast iteration when only shopify/ (liquid,
 * JSON, static assets) changed and src/ (TS/SCSS) didn't, so there's no
 * need to wait for a full `npm run build`.
 *
 * Requires dist/ to already exist from a prior full build (compiled
 * JS/CSS assets aren't produced here) -- this only re-syncs shopify/.
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../shopify");
const DIST_DIR = path.resolve(__dirname, "../dist");

const IGNORE_NAMES = new Set([".DS_Store"]);
const IGNORE_REL_DIRS = new Set(["sections/schema"]); // injected separately via inject-schemas.js, not copied

function stripJsonCommentHeader(content) {
  return content.replace(/^\/\*[\s\S]*?\*\/\s*/m, "").trim();
}

function copyRecursive(srcDir, distDir, relPath = "") {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (IGNORE_NAMES.has(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const distPath = path.join(distDir, entry.name);
    const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (IGNORE_REL_DIRS.has(entryRelPath)) continue;
      fs.mkdirSync(distPath, { recursive: true });
      copyRecursive(srcPath, distPath, entryRelPath);
      continue;
    }

    if (entry.name.endsWith(".json")) {
      const content = stripJsonCommentHeader(fs.readFileSync(srcPath, "utf8"));
      fs.writeFileSync(distPath, content);
    } else {
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`✗ ${SRC_DIR} not found.`);
  process.exit(1);
}

if (!fs.existsSync(DIST_DIR)) {
  console.error("✗ dist/ not found — run `npm run build` first (merge only re-syncs shopify/, it doesn't compile assets).");
  process.exit(1);
}

copyRecursive(SRC_DIR, DIST_DIR);
console.log("✓ Merged shopify/ into dist/");
