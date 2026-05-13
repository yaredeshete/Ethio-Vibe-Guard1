# EthioWave

A vibrant Ethiopian music community platform where users can discover tracks, follow artists, join discussions, and stay safe online — built with a cybersecurity-first approach.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/habesha-shield run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed database with 74 artists, 174 tracks, 16 genres, discussions
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui (dark mode, burgundy/green/gold theme)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (Bearer tokens via `setAuthTokenGetter` in custom-fetch) + bcrypt
- Security: Helmet, express-rate-limit (trust proxy enabled), XSS detection middleware, audit logs
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/habesha-shield/` — React/Vite frontend, path `/`
- `artifacts/api-server/` — Express API, path `/api`
- `lib/db/` — Drizzle ORM schema + DB connection
- `lib/api-spec/` — OpenAPI YAML spec (source of truth for API contracts)
- `lib/api-client-react/` — Generated React Query hooks + custom-fetch with JWT support
- `scripts/src/seed.ts` — Database seeder (74 artists, 174 tracks, 16 genres)
- `artifacts/habesha-shield/public/teddy-afro.jpg` — Teddy Afro's official photo

## Architecture decisions

- JWT tokens stored in `localStorage` under key `ethiowave_token`; `setAuthTokenGetter` in `custom-fetch` automatically attaches Bearer header to every API call.
- The frontend's `AuthProvider` wraps `useGetMe` — it must live inside a `QueryClientProvider` (set up in `main.tsx`).
- All API routes are prefixed `/api` and handled by the api-server artifact; the reverse proxy routes by path.
- `app.set("trust proxy", 1)` configured in Express to correctly handle `X-Forwarded-For` headers behind Replit's reverse proxy.
- `as any` casts are used on `{ enabled }` query options because Orval's generated types require `queryKey` but TanStack Query handles it internally.
- Theme stored in `localStorage` under key `ethiowave-theme`.
- Track discovery page uses YouTube thumbnail images (`img.youtube.com/vi/{id}/mqdefault.jpg`) with onError fallbacks — no inline iframes on list view.
- Track detail page shows a thumbnail "click to play" which loads an embedded iframe player, plus a "Watch on YouTube" external link button.
- Artist cards show live track counts from a LEFT JOIN with tracks table (not a denormalized counter).
- Genre filtering in Discover sends genre NAME (string) to API, not genre ID — the tracks table stores genre as text.
- Artist avatar photos use YouTube thumbnails (`img.youtube.com/vi/{yt_id}/hqdefault.jpg`) for visual richness.
- Teddy Afro's avatar uses the local file `/teddy-afro.jpg` served from the frontend's public directory.

## Product

- **Discover** — Browse 174 tracks across 16 genres with real YouTube thumbnail cards, like/comment functionality, and YouTube links
- **Artists** — 74 artist profiles (Amharic, Oromo, Tigrinya/Eritrean, Gospel, Hip-Hop, Gurage, Ethio-Jazz, Traditional) with follow/unfollow, track listings, and live track counts
- **Community** — Discussion forums by category (Music, Recommendations, Security Awareness, etc.)
- **Security** — Anti-scam awareness and cybersecurity education section
- **Dashboard** — Personalized feed, liked tracks, activity for logged-in users
- **Admin** — Full platform oversight: user management, reports, security alerts, audit logs

## Genres (16 total)

Amharic, Tigrinya, Oromo, Gurage, Ethio-Jazz, Tizita, Eskista, Modern Ethio-Pop, Eritrean Music, Gospel, Reggae Fusion, Electronic Fusion, Traditional, Soul & R&B, Ethiopian Hip-Hop, Afrobeats

## Seeded Accounts

- Admin: `admin@ethiowave.com` / `Admin@12345`
- All 74 artists: `{username}@ethiowave.com` / `Artist@12345`

### Artist Roster by Genre

**Amharic/Classic:**
- teddy_afro (Teddy Afro) — 8 tracks
- aster_aweke (Aster Aweke) — 5 tracks
- mahmoud_ahmed (Mahmoud Ahmed) — 2 tracks
- tilahun_gessesse (Tilahun Gessesse) — 3 tracks
- alemayehu_eshete (Alemayehu Eshete) — 1 track
- eyob_mekonnen, neway_debebe, gossaye_tesfaye, zeritu_kebede, dawit_tsige
- shambel_belayneh, muluken_melesse, abebe_teka, hirut_bekele, kuku_sebsibe
- netsanet_melesse, mekdes_tsegaye, samrawit_fikadu, elias_melka

**Ethio-Jazz / Traditional:**
- mulatu_astatke (Mulatu Astatke) — 3 tracks
- gigi_shibabaw (Gigi) — 2 tracks
- alemu_aga, teshome_nega, meklit_hadero, berhane_zerihun

**Oromo (11 artists):**
- ali_birra (Ali Birra) — 6 tracks
- hachalu_hundessa — 5 tracks
- kemer_yousuf, tamerat_molla, tesfaye_alemu, muluwork_tsegaye
- adnan_mohammed, mana_zara, raya_ebsa, abebe_girma, elilta_bekele

**Tigrinya/Eritrean (15 artists):**
- wedi_tikabo — 3 tracks
- abraham_afewerki — 3 tracks
- segen_solomon — 3 tracks
- eden_habtezion, tewelde_reda, bereket_mengisteab, tsehaye_yohannes
- ruth_yohannes, kibrom_birhane, alem_goitom, yonas_haile, fihira
- kokhob, millen_hailu, solomie_haile, haben_tesfai, dawit_eyob, yonas_tesfay

**Gospel (10 artists):**
- martha_ashagari, selam_tesfaye, dawit_mek_gospel, kebebush_girma
- helen_berhe, yilma_hailu, selamawit_yohannes, temesgen_bireda
- dagmawi_bekele, abel_mulugeta

**Ethiopian Hip-Hop (4 artists):**
- teddy_yo, lij_michael, mikael_siye, moti_biyu

**Gurage (1 artist):**
- tigabu_gebeyehu

**Reggae Fusion / Electronic:**
- haile_roots (Reggae Fusion)
- rophnan_nati (Electronic Fusion)

## User preferences

- Dark mode default; burgundy primary (#8B1A1A area), forest green secondary, amber/gold accent
- Theme toggle available in Settings page

## Gotchas

- Do not use `bcryptjs: catalog:` in scripts/package.json — it's not in the catalog, use `^3.0.3` directly.
- Dynamic `import("drizzle-orm")` doesn't work with tsx — use static imports.
- `QueryClientProvider` must wrap `AuthProvider` (see `main.tsx`).
- Wikipedia image URLs (upload.wikimedia.org) return 400 from server-side requests — use YouTube thumbnails instead.
- Genre filter in discover.tsx sends `g.name` (string) to API — NOT `g.id` (integer). The tracks table stores genre as text.
- Artist `tracksCount` comes from a live LEFT JOIN in the artists API route, not a denormalized column.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
