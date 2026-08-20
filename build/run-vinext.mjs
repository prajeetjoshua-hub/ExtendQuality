import { spawnSync } from "node:child_process";

const allowedCommands = new Set(["dev", "build", "start"]);
const command = process.argv[2];

if (!allowedCommands.has(command)) {
  console.error("Usage: node build/run-vinext.mjs <dev|build|start>");
  process.exit(2);
}

const executable = process.platform === "win32" ? "vinext.cmd" : "vinext";
const result = spawnSync(executable, [command], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
