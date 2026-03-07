# Keyflare — Agent Guidelines

## Project Overview

Keyflare is an open-source secrets manager built entirely on Cloudflare (single Worker + single D1 database). TypeScript monorepo with npm workspaces.

**Packages:**
- `packages/server/` — Cloudflare Worker API (D1, AES-256-GCM encryption)
- `packages/cli/` — CLI tool (`kfl`) using Commander.js
- `packages/shared/` — Shared types & utilities

**Docs:** `docs/` — architecture, security model, API keys, CLI reference, API reference, dev guide, deployment. Start with `docs/01-architecture.md` for the full picture.

## Documentation

**Always update the relevant docs when making code changes.** Every feature, behaviour change, new command, schema change, or workflow modification must be reflected in `docs/` before the task is considered done.

| Change type | Docs to update |
|-------------|---------------|
| New/changed API endpoint | `docs/05-api-reference.md` |
| New/changed CLI command or flag | `docs/04-cli-reference.md` |
| Schema change | `docs/01-architecture.md` (D1 Schema section) |
| New dependency or tech choice | `docs/01-architecture.md` (Technology Choices table) |
| Dev workflow change | `docs/06-development.md` |
| Deployment / init flow change | `docs/07-deployment.md` |
| Access control change | `docs/03-api-keys-and-access.md` |
| Security model change | `docs/02-security-model.md` |
