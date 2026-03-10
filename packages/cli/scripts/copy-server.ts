import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(cliRoot, "..", "..");
const serverSrc = path.join(monorepoRoot, "packages", "server");
const sharedSrc = path.join(monorepoRoot, "packages", "shared");
const serverDest = path.join(cliRoot, "dist", "server");
const sharedDest = path.join(cliRoot, "dist", "shared");

const serverFilesToCopy = [
  "src",
  "migrations",
  "package.json",
  "tsconfig.json",
];

const sharedFilesToCopy = ["src", "dist", "package.json", "tsconfig.json"];

function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

fs.mkdirSync(serverDest, { recursive: true });

for (const file of serverFilesToCopy) {
  const srcPath = path.join(serverSrc, file);
  const destPath = path.join(serverDest, file);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`Copied server: ${file}`);
  } else {
    console.warn(`Warning: server/${file} not found, skipping`);
  }
}

const serverPackageJsonPath = path.join(serverDest, "package.json");
const serverPackageJson = JSON.parse(fs.readFileSync(serverPackageJsonPath, "utf-8"));
serverPackageJson.dependencies["@keyflare/shared"] = "file:../shared";
fs.writeFileSync(serverPackageJsonPath, JSON.stringify(serverPackageJson, null, 2));
console.log("Updated server/package.json to use local @keyflare/shared");

const wranglerConfig = {
  name: "keyflare",
  main: "src/index.ts",
  compatibility_date: "2026-03-07",
  compatibility_flags: ["nodejs_compat"],
  observability: {
    enabled: true,
    logs: {
      enabled: true,
    },
  },
  d1_databases: [
    {
      binding: "DB_BINDING",
      database_name: "keyflare",
      migrations_dir: "migrations",
    },
  ],
  rules: [
    {
      type: "ESModule",
      globs: ["**/*.ts"],
      esbuild: {
        alias: {
          "@keyflare/shared": "../shared/dist/index.js",
        },
      },
    },
  ],
};
const wranglerPath = path.join(serverDest, "wrangler.jsonc");
fs.writeFileSync(wranglerPath, JSON.stringify(wranglerConfig, null, 2));
console.log("Created wrangler.jsonc with @keyflare/shared alias");

fs.mkdirSync(sharedDest, { recursive: true });

for (const file of sharedFilesToCopy) {
  const srcPath = path.join(sharedSrc, file);
  const destPath = path.join(sharedDest, file);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`Copied shared: ${file}`);
  } else {
    console.warn(`Warning: shared/${file} not found, skipping`);
  }
}

console.log(`\nServer files copied to: ${serverDest}`);
console.log(`Shared files copied to: ${sharedDest}`);
