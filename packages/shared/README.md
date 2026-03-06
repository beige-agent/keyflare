# @keyflare/shared

Shared types, constants, and utilities for Keyflare.

This package is consumed by both `@keyflare/server` (the Cloudflare Worker) and `@keyflare/cli`. It defines the API contract between the two: request/response types, key prefixes, and common helpers such as the `.env` file parser.

## Getting Started

This package is an internal workspace dependency and is not published to npm. It is consumed automatically through npm workspaces.

### Usage in other packages

```typescript
import { type ProjectInfo, type GetSecretsResponse, USER_KEY_PREFIX } from '@keyflare/shared';
```

### Local Development

```bash
# From the repo root, install all dependencies
npm install

# Build the package (outputs to dist/)
npm run build

# Or type-check without emitting
npm run typecheck
```

Because this package is referenced as `"@keyflare/shared": "*"` in the other packages, any changes you make to `src/` are picked up after rebuilding.

## Package Contents

| File | Description |
|------|-------------|
| `src/types.ts` | API request/response types shared by server and CLI |
| `src/constants.ts` | Key prefixes (`kfl_user_`, `kfl_sys_`) and other shared constants |
| `src/index.ts` | Public entry point — re-exports all types and constants |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check via `tsc --noEmit` |
| `npm test` | Run tests with Vitest |

## Further Reading

- [Architecture](../../docs/01-architecture.md)
- [Development Guide](../../docs/06-development.md)
