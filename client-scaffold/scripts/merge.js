#!/usr/bin/env node
/**
 * Merges base/dist/ + shopify/ into dist/
 * Cross-platform — works on Mac, Windows, Linux.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Auto-init submodules if base not cloned
const baseDist = path.join('base', 'dist');
if (!fs.existsSync(path.join('base', 'package.json'))) {
  console.log('Base theme not found — initialising submodules...');
  execSync('git submodule update --init --recursive', { stdio: 'inherit' });
}
// Auto-build if base/dist doesn't exist (it's gitignored in the base repo)
if (!fs.existsSync(baseDist) || fs.readdirSync(baseDist).length === 0) {
  console.log('Base theme not built — building...');
  execSync('cd base && npm install && npm run webpack:build', { stdio: 'inherit' });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Copy base then overlay
console.log('Building dist/...');
copyDir(path.join('base', 'dist'), 'dist');
copyDir('shopify', 'dist');

// Fix JSON files with JS comment headers (Shopify adds these on pull)
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

const count = (function countFiles(dir) {
  let n = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
})('dist');

console.log(`Done. ${count} files in dist/`);
