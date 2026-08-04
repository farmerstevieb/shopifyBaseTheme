const { getBranchThemeName, ensureThemeExists, shopifySpawn } = require("./lib/theme-branch");

const branch = getBranchThemeName();
ensureThemeExists(branch);

console.log(`→ Starting live dev session on theme "${branch}"...`);

const child = shopifySpawn(["theme", "dev", "-e", "local", "--theme", branch, ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
