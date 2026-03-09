import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import app from "../src/index.js";
import { openAPIRouteHandler } from "hono-openapi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openApiSpec = openAPIRouteHandler(app, {
  documentation: {
    openapi: "3.1.0",
    info: {
      title: "Keyflare API",
      version: "0.1.0",
      description:
        "Open-source secrets manager built entirely on Cloudflare. One Worker. One D1 database. Zero trust storage.",
      contact: {
        name: "Keyflare",
        url: "https://github.com/keyflare/keyflare",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "https://keyflare.YOUR_ACCOUNT.workers.dev",
        description: "Your Keyflare deployment",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key authentication (kfl_user_* or kfl_sys_*)",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Bootstrap", description: "Initial setup endpoints" },
      { name: "Keys", description: "API key management" },
      { name: "Projects", description: "Project management" },
      { name: "Configs", description: "Environment/config management" },
      { name: "Secrets", description: "Secret management" },
    ],
  },
});

const outputPath = join(__dirname, "..", "..", "..", "docs", "openapi.json");

const mockRequest = new Request("http://localhost/openapi.json");
const response = await openApiSpec(mockRequest);
const spec = await response.json();

writeFileSync(outputPath, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);
