# @keyflare/cli

Keyflare CLI — `kfl`.

The `kfl` command-line tool is the primary interface for managing secrets in Keyflare. It communicates with the Keyflare Worker API over HTTPS.

## Getting Started

### Installation

```bash
npm install -g @keyflare/cli
```

### Initial Setup

Deploy Keyflare to your Cloudflare account and generate your first API key:

```bash
kfl init
```

This interactive command will:
1. Verify your Cloudflare API token
2. Create a D1 database
3. Generate a 256-bit master encryption key
4. Deploy the Keyflare Worker
5. Run database migrations
6. Create your first user API key

### Basic Usage

```bash
# Create a project
kfl projects create my-api

# Create an environment inside the project
kfl configs create production --project my-api

# Upload secrets from a .env file
kfl upload .env.production --project my-api --config production

# Inject secrets into a command at runtime (no disk writes)
kfl run --project my-api --config production -- npm start

# Download secrets as a .env file
kfl download --project my-api --config production --output .env
```

### Configuration

The CLI stores its configuration (API URL and key) in `~/.config/keyflare/` after running `kfl init`. You can also use environment variables:

| Variable | Description |
|----------|-------------|
| `KEYFLARE_API_KEY` | API key (overrides the credentials file) |
| `KEYFLARE_API_URL` | API URL (overrides the config file) |
| `KEYFLARE_PROJECT` | Default project |
| `KEYFLARE_CONFIG` | Default config/environment |

### Local Development

```bash
# From the repo root, install all dependencies
npm install

# Point the CLI at a locally running Keyflare server
export KEYFLARE_API_URL=http://localhost:8787
export KEYFLARE_API_KEY=kfl_user_<your-local-bootstrap-key>

# Run CLI commands during development (from this package directory)
npm run dev -- projects list

# Or from the repo root
npx tsx packages/cli/src/index.ts projects list
```

### Building

```bash
npm run build
```

Produces a bundled `dist/index.js` (ESM) that is referenced by the `kfl` bin entry.

## Commands

| Command | Description |
|---------|-------------|
| `kfl init` | Bootstrap a new Keyflare deployment |
| `kfl projects list/create/delete` | Manage projects |
| `kfl configs list/create/delete` | Manage environments |
| `kfl secrets set/get/delete/list` | Manage individual secrets |
| `kfl upload <file>` | Upload a `.env` file (full replace) |
| `kfl download` | Download secrets (`.env`, JSON, YAML) |
| `kfl run -- <cmd>` | Inject secrets into a child process |
| `kfl keys list/create/revoke` | Manage API keys |
| `kfl dev init/server` | Local development helpers |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run CLI via `tsx` (no build step) |
| `npm run build` | Bundle with `tsup` |
| `npm run typecheck` | Type-check via `tsc --noEmit` |
| `npm test` | Run tests with Vitest |

## Further Reading

- [CLI Reference](../../docs/04-cli-reference.md)
- [API Keys & Access Control](../../docs/03-api-keys-and-access.md)
- [Development Guide](../../docs/06-development.md)
