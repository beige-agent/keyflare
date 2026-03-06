import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".config", "keyflare");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.toml");
const CREDENTIALS_FILE = path.join(CONFIG_DIR, "credentials");

export interface KeyflareConfig {
  apiUrl: string;
  project?: string;
  environment?: string;
}

function ensureConfigDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

export function readConfig(): Partial<KeyflareConfig> {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf8");
    const config: Partial<KeyflareConfig> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^api_url\s*=\s*"(.+)"/);
      if (m) config.apiUrl = m[1];
      const mp = line.match(/^project\s*=\s*"(.+)"/);
      if (mp) config.project = mp[1];
      const me = line.match(/^environment\s*=\s*"(.+)"/);
      if (me) config.environment = me[1];
    }
    return config;
  } catch {
    return {};
  }
}

export function writeConfig(config: KeyflareConfig) {
  ensureConfigDir();
  const lines = [`[default]`, `api_url = "${config.apiUrl}"`];
  if (config.project) lines.push(`project = "${config.project}"`);
  if (config.environment) lines.push(`environment = "${config.environment}"`);
  fs.writeFileSync(CONFIG_FILE, lines.join("\n") + "\n", "utf8");
}

export function readApiKey(): string | undefined {
  // Env var takes highest precedence
  if (process.env.KEYFLARE_API_KEY) return process.env.KEYFLARE_API_KEY;
  try {
    return fs.readFileSync(CREDENTIALS_FILE, "utf8").trim();
  } catch {
    return undefined;
  }
}

export function writeApiKey(key: string) {
  ensureConfigDir();
  fs.writeFileSync(CREDENTIALS_FILE, key + "\n", { mode: 0o600 });
}

export function getApiUrl(): string {
  if (process.env.KEYFLARE_API_URL) return process.env.KEYFLARE_API_URL;
  const config = readConfig();
  return config.apiUrl ?? "http://localhost:8787";
}

export function isLocalMode(): boolean {
  return (
    process.env.KEYFLARE_LOCAL === "true" ||
    getApiUrl().startsWith("http://localhost")
  );
}
