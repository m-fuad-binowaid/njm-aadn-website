# نجم عدن موبايل

An Arabic RTL mobile storefront showcasing phones and accessories with a WhatsApp-first inquiry flow.

## Run & Operate

- Start or restart the managed `artifacts/nijm-aden-mobile: web` workflow — run the storefront at `/`
- Start or restart the managed `artifacts/api-server: API Server` workflow — run the API at `/api`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — supplied by Replit's managed PostgreSQL database

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nijm-aden-mobile` — React/Vite storefront
- `artifacts/api-server` — Express API
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema` — Drizzle database schema
- `artifacts/nijm-aden-mobile/src/index.css` — storefront theme and global styles

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

Visitors can browse a premium Arabic product catalog and start product inquiries through WhatsApp.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
