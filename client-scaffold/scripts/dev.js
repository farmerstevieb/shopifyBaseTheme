#!/usr/bin/env node
/**
 * Dev server:
 * 1. Build dist/
 * 2. First run: duplicate staging theme via CLI (perfect copy with all templates)
 * 3. Push code changes to dev theme
 * 4. Start hot reload
 *
 * CONFIG — update per project:
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE = 'YOUR-STORE.myshopify.com';
const STAGING_THEME = 'YOUR_THEME_ID';
const ID_FILE = '.dev-theme-id';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function runJSON(cmd) {
  return JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
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

if (!fs.existsSync(path.join('base', 'package.json'))) {
  console.log('   Initialising submodules...');
  run('git submodule update --init --recursive');
}

const baseDist = path.join('base', 'dist');
if (!fs.existsSync(baseDist) || fs.readdirSync(baseDist).length === 0) {
  console.log('   Building base theme (first time only)...');
  run('cd base && npm install && npm run webpack:build');
}

copyDir(baseDist, 'dist');
copyDir('shopify', 'dist');

// Fix JSON files with comment headers
for (const dir of ['templates', 'sections']) {
  const dirPath = path.join('dist', dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const file of fs.readdirSync(dirPath)) {
    if (!file.endsWith('.json')) continue;
    const fpath = path.join(dirPath, file);
    let content = fs.readFileSync(fpath, 'utf-8');
    if (content.startsWith('/*')) {
      const idx = content.indexOf('{');
      if (idx > 0) fs.writeFileSync(fpath, content.slice(idx));
    }
  }
}
console.log('   Done.');

// ── Step 2: Resolve dev theme ──
let theme;
if (fs.existsSync(ID_FILE)) {
  theme = fs.readFileSync(ID_FILE, 'utf-8').trim();
  console.log(`\n2. Using dev theme: ${theme}`);
} else {
  console.log('\n2. Creating your dev theme (duplicating staging)...');
  const hostname = os.hostname().split('.')[0].replace(/[^a-zA-Z0-9-]/g, '');
  const name = `Dev-${hostname}`;

  try {
    const result = runJSON(
      `shopify theme duplicate --theme ${STAGING_THEME} --name "${name}" --store ${STORE} --force --json`
    );
    theme = String(result.theme.id);
    fs.writeFileSync(ID_FILE, theme);
    console.log(`   Created: ${name} (#${theme})`);
    console.log('   Waiting for Shopify to finish duplicating (30s)...');
    execSync('sleep 30');
  } catch (e) {
    console.error('   Failed to duplicate theme. Falling back to staging.');
    theme = STAGING_THEME;
  }
}

// ── Step 3: Push code changes ──
console.log(`\n3. Pushing code to theme ${theme}...`);
try {
  run(`shopify theme push --path dist --theme ${theme} --store ${STORE}`);
} catch (e) {
  console.log('   Push had errors — continuing...');
}

// ── Step 4: Start dev server ──
console.log(`\n4. Starting dev server...`);
console.log(`   Preview: https://${STORE}/?preview_theme_id=${theme}\n`);
run(`shopify theme dev --path dist --theme ${theme} --store ${STORE}`);
