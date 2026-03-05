/**
 * inject-schemas.js
 *
 * For each sections/schema/*.js file (excluding parts/), requires the module
 * to get the schema object and appends it as a {% schema %}...{% endschema %}
 * block to the corresponding dist/sections/<name>.liquid file.
 *
 * Sections that already have a {% schema %} block (hand-authored) are skipped.
 */

const fs = require("fs");
const path = require("path");

const schemaDir = path.resolve(__dirname, "../shopify/sections/schema");
const distSectionsDir = path.resolve(__dirname, "../dist/sections");

if (!fs.existsSync(distSectionsDir)) {
  console.error("dist/sections not found — run webpack build first");
  process.exit(1);
}

let injected = 0;
let skipped = 0;

for (const file of fs.readdirSync(schemaDir)) {
  if (!file.endsWith(".js")) continue; // skip parts/ subdirectory entries

  const name = file.replace(/\.js$/, "");
  const liquidPath = path.join(distSectionsDir, `${name}.liquid`);

  if (!fs.existsSync(liquidPath)) {
    // No matching liquid file — schema-only or layout section
    continue;
  }

  const liquidContent = fs.readFileSync(liquidPath, "utf8");

  if (liquidContent.includes("{% schema %}")) {
    skipped++;
    continue; // already has a hand-authored schema
  }

  let schema;
  try {
    // Clear require cache so changes are picked up on repeated runs
    delete require.cache[require.resolve(path.join(schemaDir, file))];
    schema = require(path.join(schemaDir, file));
  } catch (e) {
    console.warn(`  ⚠ Could not load schema for ${name}: ${e.message}`);
    continue;
  }

  const schemaJson = JSON.stringify(schema, null, 2);
  const schemaBlock = `\n{% schema %}\n${schemaJson}\n{% endschema %}\n`;

  fs.writeFileSync(liquidPath, liquidContent + schemaBlock, "utf8");
  injected++;
}

console.log(`✓ Injected schemas into ${injected} section(s) (${skipped} already had schema)`);
