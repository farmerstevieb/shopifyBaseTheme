#!/usr/bin/env node
/**
 * Dev server — auto-creates personal theme on first run, reuses after.
 *
 * First run:  clones staging theme → saves ID to .dev-theme-id → starts dev
 * After that: reuses saved theme ID → starts dev
 *
 * Change STAGING_THEME when the theme ID changes.
 */

const { execSync } = require('child_process');
const fs = require('fs');

const STORE = 'YOUR-STORE.myshopify.com';
const STAGING_THEME = 'YOUR_THEME_ID';
const ID_FILE = '.dev-theme-id';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf-8' });
}

let theme;

if (fs.existsSync(ID_FILE)) {
  theme = fs.readFileSync(ID_FILE, 'utf-8').trim();
  console.log(`\nUsing your dev theme: ${theme}\n`);
} else {
  console.log('\nFirst run — creating your personal dev theme...\n');

  // Pull settings from staging into dist
  console.log('Pulling settings from staging theme...');
  run(`shopify theme pull --path dist --theme ${STAGING_THEME} --store ${STORE} --only "config/settings_data.json"`);

  // Push as unpublished theme
  console.log('\nCreating your theme (this takes ~60s)...\n');
  run(`shopify theme push --path dist --store ${STORE} --unpublished`);

  // Ask dev to enter their theme ID
  console.log('\n========================================');
  console.log('Copy the theme ID from the output above');
  console.log('and paste it into .dev-theme-id:');
  console.log('');
  console.log('  echo THEME_ID > .dev-theme-id');
  console.log('');
  console.log('Then run: npm run dev');
  console.log('========================================\n');
  process.exit(0);
}

// Sync settings from staging before starting
try {
  execSync(
    `shopify theme pull --path dist --theme ${STAGING_THEME} --store ${STORE} --only "config/settings_data.json"`,
    { stdio: 'pipe' }
  );
} catch (e) {
  // Silent fail — local settings still work
}

console.log(`Preview: https://${STORE}/?preview_theme_id=${theme}\n`);
run(`shopify theme dev --path dist --theme ${theme} --store ${STORE}`);
