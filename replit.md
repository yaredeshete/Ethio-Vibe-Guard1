# HabeshaShield

A secure Ethiopian music community platform where users can discover tracks, follow artists, join discussions, and stay safe online — built with a cybersecurity-first approach.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/habesha-shield run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed database with artists, tracks, genres, discussions
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui (dark mode, burgundy/green/gold theme)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (Bearer tokens via `setAuthTokenGetter` in custom-fetch) + bcrypt
- Security: Helmet, express-rate-limit, XSS detection middleware, audit logs
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/habesha-shield/` — React/Vite frontend, path `/`
- `artifacts/api-server/` — Express API, path `/api`
- `lib/db/` — Drizzle ORM schema + DB connection
- `lib/api-spec/` — OpenAPI YAML spec (source of truth for API contracts)
- `lib/api-client-react/` — Generated React Query hooks + custom-fetch with JWT support
- `scripts/src/seed.ts` — Database seeder

## Architecture decisions

- JWT tokens stored in `localStorage`; `setAuthTokenGetter` in `custom-fetch` automatically attaches Bearer header to every API call.
- The frontend's `AuthProvider` wraps `useGetMe` — it must live inside a `QueryClientProvider` (set up in `main.tsx`).
- All API routes are prefixed `/api` and handled by the api-server artifact; the reverse proxy routes by path.
- `as any` casts are used on `{ enabled }` query options because Orval's generated types require `queryKey` but TanStack Query handles it internally.
- Seeded artists use `pravatar.cc` placeholder avatars; tracks use real YouTube IDs for authentic Ethiopian music.

## Product

- **Discover** — Browse Ethiopian tracks by genre with like/comment functionality
- **Artists** — Artist profiles with follow/unfollow and track listings
- **Community** — Discussion forums by category (Music, Recommendations, Security Awareness, etc.)
- **Security** — Anti-scam awareness and cybersecurity education section
- **Dashboard** — Personalized feed, liked tracks, activity for logged-in users
- **Admin** — Full platform oversight: user management, reports, security alerts, audit logs

## Seeded Accounts

- Admin: `admin@habesha.com` / `Admin@12345`
- Artists: `teddy@habesha.com`, `aster@habesha.com`, `mulatu@habesha.com`, `mahmoud@habesha.com` / `Artist@12345`

## User preferences

- Dark mode default; burgundy primary (#8B1A1A area), forest green secondary, amber/gold accent
- Theme toggle available in Settings page

## Gotchas

- Do not use `bcryptjs: catalog:` in scripts/package.json — it's not in the catalog, use `^3.0.3` directly.
- Dynamic `import("drizzle-orm")` doesn't work with tsx — use static imports.
- `QueryClientProvider` must wrap `AuthProvider` (see `main.tsx`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
