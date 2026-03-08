import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { makeDebug, redact } from "./debug.js";

const CONFIG_DIR = path.join(os.homedir(), ".config", "keyflare");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.toml");
const CREDENTIALS_FILE = path.join(CONFIG_DIR, "credentials");
const debug = makeDebug("config");

export interface KeyflareConfig {
  apiUrl: string;
  project?: string;
  environment?: string;
}

function ensureConfigDir() {
  debug("ensure config dir: %s", CONFIG_DIR);
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

export function readConfig(): Partial<KeyflareConfig> {
  try {
    debug("reading config: %s", CONFIG_FILE);
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
    debug("config loaded: apiUrl=%s project=%s environment=%s", config.apiUrl, config.project, config.environment);
    return config;
  } catch {
    debug("config not found or unreadable: %s", CONFIG_FILE);
    return {};
  }
}

export function writeConfig(config: KeyflareConfig) {
  debug("writing config: apiUrl=%s project=%s environment=%s", config.apiUrl, config.project, config.environment);
  ensureConfigDir();
  const lines = [`[default]`, `api_url = "${config.apiUrl}"`];
  if (config.project) lines.push(`project = "${config.project}"`);
  if (config.environment) lines.push(`environment = "${config.environment}"`);
  fs.writeFileSync(CONFIG_FILE, lines.join("\n") + "\n", "utf8");
}

export function readApiKey(): string | undefined {
  // Env var takes highest precedence
  if (process.env.KEYFLARE_API_KEY) {
    debug("using API key from env KEYFLARE_API_KEY (%s)", redact(process.env.KEYFLARE_API_KEY));
    return process.env.KEYFLARE_API_KEY;
  }
  try {
    const key = fs.readFileSync(CREDENTIALS_FILE, "utf8").trim();
    debug("using API key from credentials file (%s)", redact(key));
    return key;
  } catch {
    debug("no API key found in env or credentials file");
    return undefined;
  }
}

export function writeApiKey(key: string) {
  debug("writing credentials file with API key (%s)", redact(key));
  ensureConfigDir();
  fs.writeFileSync(CREDENTIALS_FILE, key + "\n", { mode: 0o600 });
}

export function getApiUrl(): string {
  if (process.env.KEYFLARE_API_URL) {
    debug("using API URL from env: %s", process.env.KEYFLARE_API_URL);
    return process.env.KEYFLARE_API_URL;
  }
  const config = readConfig();
  const url = config.apiUrl ?? "http://localhost:8787";
  debug("resolved API URL: %s", url);
  return url;
}

export function isLocalMode(): boolean {
  return (
    process.env.KEYFLARE_LOCAL === "true" ||
    getApiUrl().startsWith("http://localhost")
  );
}
