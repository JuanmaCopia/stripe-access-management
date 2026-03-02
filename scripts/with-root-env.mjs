import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");

function parseEnvFile(filePath) {
  const entries = {};
  const fileContents = readFileSync(filePath, "utf8");

  for (const rawLine of fileContents.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

const env = { ...process.env };
const envFiles = [resolve(rootDir, ".env"), resolve(rootDir, ".env.local")];
const binPaths = [
  resolve(rootDir, "node_modules", ".bin"),
  resolve(process.cwd(), "node_modules", ".bin")
];

for (const envFile of envFiles) {
  if (!existsSync(envFile)) {
    continue;
  }

  Object.assign(env, parseEnvFile(envFile));
}

env.PATH = [...binPaths, env.PATH].filter(Boolean).join(delimiter);

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("with-root-env requires a command to run.");
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
