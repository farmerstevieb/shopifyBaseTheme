#!/usr/bin/env node
/**
 * Dev server — complete flow:
 * 1. Build dist/ from base + overlay
 * 2. Pull settings from staging theme
 * 3. Re-apply overlay (in case pull overwrote files)
 * 4. Push to personal dev theme (--nodelete)
 * 5. Start hot reload (with protected files ignored)
 *
 * First run: creates personal theme, saves ID
 * After that: reuses saved theme
 *
 * CONFIG — update these per project:
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STORE = 'YOUR-STORE.myshopify.com';
const STAGING_THEME = 'YOUR_THEME_ID';
const ID_FILE = '.dev-theme-id';

// Files that must not be hot-reloaded (Shopify rejects delete/re-upload on these)
const PROTECTED_FILES = [
  'sections/header-group.json',
  'sections/footer-group.json',
  'sections/dialog-group.json',
  'config/settings_data.json',
  'config/settings_schema.json',
  'layout/theme.liquid',
  'templates/gift_card.liquid',
];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// ── Step 1: Build dist ──
console.log('\n1. Building dist/...');
if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });

const baseDist = path.join('base', 'dist');
if (!fs.existsSync(baseDist) || fs.readdirSync(baseDist).length === 0) {
  console.log('   Base theme not found — initialising submodules...');
  run('git submodule update --init --recursive');
}

copyDir(baseDist, 'dist');
copyDir('shopify', 'dist');
console.log('   Done.');

// ── Step 2: Pull settings from staging ──
console.log('\n2. Pulling settings from staging theme...');
try {
  run(`shopify theme pull --path dist --theme ${STAGING_THEME} --store ${STORE} --only "config/settings_data.json"`);
} catch (e) {
  console.log('   Settings pull failed — using local settings.');
}

// ── Step 3: Re-apply overlay (pull may have overwritten group JSONs) ──
console.log('\n3. Restoring overlay files...');
copyDir('shopify', 'dist');

// ── Step 4: Resolve theme ID ──
let theme;
if (fs.existsSync(ID_FILE)) {
  theme = fs.readFileSync(ID_FILE, 'utf-8').trim();
  console.log(`\n4. Using your dev theme: ${theme}`);
} else {
  console.log('\n4. First run — creating your personal dev theme...');
  console.log('   This takes ~60 seconds...\n');
  run(`shopify theme push --path dist --store ${STORE} --unpublished --nodelete`);

  console.log('\n   ════════════════════════════════════════');
  console.log('   Copy the theme ID from the output above.');
  console.log('   Then run:');
  console.log('');
  console.log('     echo THEME_ID > .dev-theme-id');
  console.log('     npm run dev');
  console.log('');
  console.log('   ════════════════════════════════════════\n');
  process.exit(0);
}

// ── Step 5: Push to dev theme ──
console.log('\n5. Syncing files to your dev theme...');
try {
  run(`shopify theme push --path dist --theme ${theme} --store ${STORE} --nodelete`);
} catch (e) {
  console.log('   Push had errors — continuing...');
}

// ── Step 6: Start dev server ──
const ignores = PROTECTED_FILES.map(f => `--ignore "${f}"`).join(' ');
console.log(`\n6. Starting dev server...`);
console.log(`   Preview: https://${STORE}/?preview_theme_id=${theme}\n`);

run(`shopify theme dev --path dist --theme ${theme} --store ${STORE} ${ignores}`);
