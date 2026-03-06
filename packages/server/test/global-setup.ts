import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Path where Miniflare will persist D1 state during this test run.
 * Written to a temp dir so it is:
 *   1. Isolated from the real local dev .wrangler/ state
 *   2. Cleaned up after every test run
 */
export const TEST_WRANGLER_DIR = path.join(
  os.tmpdir(),
  `keyflare-test-${process.pid}`
);

export default function globalSetup() {
  // Create the temp dir before tests start
  fs.mkdirSync(TEST_WRANGLER_DIR, { recursive: true });

  // Return teardown — runs after all tests complete (pass or fail)
  return function teardown() {
    try {
      fs.rmSync(TEST_WRANGLER_DIR, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup
    }
  };
}
