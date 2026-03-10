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

// Read the repo's wrangler.jsonc, strip comments, inject the alias for
// @keyflare/shared so esbuild can resolve it from the bundled shared package,
// then write it out as JSON. This keeps the generated config in sync with
// any future changes to the source wrangler.jsonc (new bindings, vars, etc.).
const wranglerSrcPath = path.join(serverSrc, "wrangler.jsonc");
const wranglerRaw = fs.readFileSync(wranglerSrcPath, "utf-8");
const wranglerStripped = wranglerRaw.replace(/\/\/.*$/gm, "");
const wranglerConfig = JSON.parse(wranglerStripped) as Record<string, unknown>;
wranglerConfig.alias = {
  "@keyflare/shared": "../shared/dist/index.js",
};
const wranglerDestPath = path.join(serverDest, "wrangler.jsonc");
fs.writeFileSync(wranglerDestPath, JSON.stringify(wranglerConfig, null, 2));
console.log("Created wrangler.jsonc (from repo source + @keyflare/shared alias)");

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
