#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runDevServer, runDevInit } from "./commands/dev.js";
import { error } from "./output/log.js";

const program = new Command();

program
  .name("kfl")
  .description("Keyflare — open-source secrets manager on Cloudflare")
  .version("0.1.0");

// ─── kfl init ────────────────────────────────────────────────
program
  .command("init")
  .description(
    "Bootstrap a new Keyflare deployment on Cloudflare. " +
    "Supports OAuth (browser) and API token authentication."
  )
  .option("--force", "Re-run even if already initialised")
  .action(async (opts) => {
    await runInit(opts).catch(handleError);
  });

// ─── kfl dev ─────────────────────────────────────────────────
const dev = program
  .command("dev")
  .description("Local development helpers (no Cloudflare account required)");

dev
  .command("init")
  .description(
    "Set up a local Keyflare instance. Generates a local master key, " +
    "applies migrations, bootstraps the DB, and saves credentials " +
    "pointing at http://localhost:8787.\n\n" +
    "Set KEYFLARE_LOCAL=true to make all other kfl commands use localhost."
  )
  .option("--force", "Regenerate the local master key")
  .action(async (opts) => {
    await runDevInit(opts).catch(handleError);
  });

dev
  .command("server")
  .description(
    "Start the Keyflare server locally via wrangler dev (port 8787).\n" +
    "Run `kfl dev init` first to set up the local database."
  )
  .option("--port <port>", "Port to listen on", "8787")
  .action(async (opts) => {
    await runDevServer({ port: parseInt(opts.port, 10) }).catch(handleError);
  });

// ─── Error handler ────────────────────────────────────────────
function handleError(err: unknown) {
  if (err instanceof Error) {
    error(err.message);
  } else {
    error(String(err));
  }
  process.exit(1);
}

program.parse();
