#!/usr/bin/env node
/**
 * Dev server — auto-creates personal theme on first run, reuses after.
 * Cross-platform — works on Mac, Windows, Linux.
 *
 * CONFIG: Update these two values for each client project.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// ─── CLIENT CONFIG (update per project) ───────────────────────
const STORE = 'YOUR-STORE.myshopify.com';   // ← Change this
const STAGING_THEME = 'YOUR_THEME_ID';       // ← Change this
// ───────────────────────────────────────────────────────────────

const ID_FILE = '.dev-theme-id';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

if (STORE === 'YOUR-STORE.myshopify.com' || STAGING_THEME === 'YOUR_THEME_ID') {
  console.error('\n  ERROR: Update STORE and STAGING_THEME in scripts/dev.js\n');
  process.exit(1);
}

let theme;

if (fs.existsSync(ID_FILE)) {
  theme = fs.readFileSync(ID_FILE, 'utf-8').trim();
  console.log(`\nUsing your dev theme: ${theme}\n`);
} else {
  console.log('\nFirst run — creating your personal dev theme...\n');

  console.log('Pulling settings from staging theme...');
  run(`shopify theme pull --path dist --theme ${STAGING_THEME} --store ${STORE} --only "config/settings_data.json"`);

  console.log('\nCreating your theme (this takes ~60s)...\n');
  run(`shopify theme push --path dist --store ${STORE} --unpublished`);

  console.log('\n========================================');
  console.log('Copy the theme ID from the output above');
  console.log('and save it:');
  console.log('');
  console.log('  echo THEME_ID > .dev-theme-id');
  console.log('');
  console.log('Then run: npm run dev');
  console.log('========================================\n');
  process.exit(0);
}

// Sync settings silently
try {
  execSync(
    `shopify theme pull --path dist --theme ${STAGING_THEME} --store ${STORE} --only "config/settings_data.json"`,
    { stdio: 'pipe' }
  );
} catch (e) { /* continue with local settings */ }

console.log(`Preview: https://${STORE}/?preview_theme_id=${theme}\n`);
run(`shopify theme dev --path dist --theme ${theme} --store ${STORE}`);
