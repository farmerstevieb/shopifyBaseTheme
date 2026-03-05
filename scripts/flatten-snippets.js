const fs = require("fs");
const path = require("path");

const snippetsDir = path.resolve(__dirname, "../dist/snippets");

if (!fs.existsSync(snippetsDir)) {
  console.error("dist/snippets not found — run webpack build first");
  process.exit(1);
}

let moved = 0;
for (const entry of fs.readdirSync(snippetsDir)) {
  const entryPath = path.join(snippetsDir, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    for (const file of fs.readdirSync(entryPath)) {
      const src = path.join(entryPath, file);
      const flatName = `${entry}_${file.replace(/^_/, "")}`;
      fs.renameSync(src, path.join(snippetsDir, flatName));
      moved++;
    }
    fs.rmdirSync(entryPath);
  }
}

console.log("✓ Flattened " + moved + " snippet(s)");
