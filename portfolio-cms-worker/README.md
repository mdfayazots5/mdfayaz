# Portfolio CMS API — Cloudflare Worker

Drop-in backend for the portfolio's React 19 + Vite frontend. Zero runtime dependencies;
storage is a single R2 bucket holding one JSON file per collection. Every route's shape
mirrors [`src/services/api.ts`](../src/services/api.ts) and
[`src/models/portfolio.model.ts`](../src/models/portfolio.model.ts) in the frontend repo —
those files are the contract source of truth.

## Architecture

```
Request
  │
  ▼
src/index.ts (router)
  │  1. handlePreflight()      → 204 for OPTIONS
  │  2. match method + path
  │  3. requireAuth()          → 401 if mutating route lacks a valid Bearer JWT
  │  4. dispatch to handler
  │  5. top-level try/catch    → 500 via errorResponse()
  ▼
src/handlers/*.handler.ts
  │  readJson<T>() / writeJson<T>()   (src/utils/store.ts)
  ▼
R2 bucket (binding: CMS_BUCKET)
  data/entries.json
  data/services.json
  data/faq.json
  data/uses.json
  data/privacy.json
  data/about.json
  data/site-settings.json
```

- **`src/types.ts`** — every interface transcribed verbatim from `portfolio.model.ts`, plus
  the `R2_KEYS` map of R2 object keys.
- **`src/auth.ts`** — PBKDF2 (100k iterations, SHA-256) password hashing and a manual
  HS256 JWT (Web Crypto only — no Node crypto).
- **`src/middleware/auth-guard.ts`** — `requireAuth()` parses `Authorization: Bearer <token>`
  and verifies the JWT.
- **`src/handlers/`** — one module per resource. Each does a full read-modify-write of its
  R2 JSON file per mutation; every R2/JSON operation is wrapped in try-catch.
- **Responses are bare.** `GET /entries` returns `Entry[]` directly — never
  `{ success, data }`. `PUT`/`DELETE` mutations that don't return an entity return
  `{ success: true }`.

## Route table

All paths are relative to `VITE_API_BASE_URL`. No `/api` prefix, no `/admin` segment.

### Public (no auth)

| Method | Path        | Returns             |
| ------ | ----------- | -------------------- |
| GET    | `/health`   | `{ status: 'ok', r2: true }` (200) or `{ status: 'degraded', r2: false }` (503) — pings R2 |
| POST   | `/auth/login` | `{ token, expiresAt }` or 401 |
| GET    | `/entries`  | `Entry[]`           |
| GET    | `/services` | `Service[]`         |
| GET    | `/faq`      | `FaqItem[]`         |
| GET    | `/uses`     | `UsesCategory[]`    |
| GET    | `/privacy`  | `PrivacySection[]`  |
| GET    | `/about`    | `AboutProfile`      |
| GET    | `/settings` | `SiteSettings`      |

### Auth required (`Authorization: Bearer <jwt>`)

| Method | Path                                       | Returns                     |
| ------ | ------------------------------------------- | ---------------------------- |
| POST   | `/entries`                                  | created `Entry`              |
| PUT    | `/entries/:id`                              | updated `Entry`               |
| DELETE | `/entries/:id`                              | `{ success: true }`          |
| POST   | `/services`                                 | created `Service`             |
| PUT    | `/services/:id`                             | updated `Service`              |
| DELETE | `/services/:id`                             | `{ success: true }`          |
| POST   | `/faq`                                      | created `FaqItem`             |
| PUT    | `/faq/:id`                                  | updated `FaqItem`              |
| DELETE | `/faq/:id`                                  | `{ success: true }`          |
| POST   | `/uses`                                     | created `UsesCategory`         |
| PUT    | `/uses/:id`                                 | updated `UsesCategory`          |
| DELETE | `/uses/:id`                                 | `{ success: true }`          |
| POST   | `/uses/:categoryId/items`                   | created `UsesItem`              |
| PUT    | `/uses/:categoryId/items/:itemId`           | updated `UsesItem`               |
| DELETE | `/uses/:categoryId/items/:itemId`           | `{ success: true }`          |
| POST   | `/privacy`                                  | created `PrivacySection`         |
| PUT    | `/privacy/:id`                              | updated `PrivacySection`          |
| DELETE | `/privacy/:id`                              | `{ success: true }`          |
| POST   | `/privacy/reorder`                          | `{ success: true }` (body: `{ orderedIds: string[] }`) |
| PUT    | `/about`                                    | `{ success: true }`          |
| PUT    | `/settings`                                 | `{ success: true }`          |
| POST   | `/upload`                                   | `{ url }` (multipart form: `file`, `category`) |
| DELETE | `/upload/:key`                              | `{ success: true }`          |

IDs: numeric entities (`entries`, `services`, `faq`) use `max(id)+1`. String-keyed entities
use `` `${prefix}_${Date.now()}` `` — `cat_`/`item_` for uses, `priv_` for privacy. No slugs
anywhere.

## Local development

```bash
npm install
cp .dev.vars .dev.vars.local   # optional; .dev.vars already has placeholder secrets
npm run dev                    # wrangler dev
npm run typecheck              # tsc --noEmit
```

`wrangler dev` runs against the `preview_bucket_name` R2 bucket (`mdfayaz-dev`) defined in
`wrangler.toml` — deliberately separate from the production bucket (`mdfayaz`) so local testing
never mutates live data. Create it once with `wrangler r2 bucket create mdfayaz-dev`.

### Secrets & production hardening

`.dev.vars` holds **local** placeholders only and is git-ignored (never commit it). For the
deployed Worker, set real secrets via Wrangler — they must never live in `wrangler.toml [vars]`:

```bash
wrangler secret put JWT_SECRET            # 32+ random bytes, NOT a guessable word
wrangler secret put ADMIN_PASSWORD_HASH   # salt:hash from generateHash() in src/auth.ts
wrangler secret put ADMIN_USERNAME
```

Rotating `JWT_SECRET` immediately invalidates every issued token (the app's revocation lever).
Before going live, also set `ALLOWED_ORIGIN_PROD` to the real site origin — CORS rejects any
Origin not listed, so leaving it on `localhost` blocks the deployed frontend.

## Seeding data

`seed/*.json` mirrors the frontend's `src/data/fallback/*.fallback.ts` modules, so a freshly
seeded Worker and a freshly loaded frontend (with no `VITE_API_BASE_URL`) start from identical
content.

`seed/seed.ts` exports `seed(env)`, which writes all seven JSON files to their `R2_KEYS`
locations. It's idempotent — safe to re-run. Options to run it:

- Bind it as a temporary Worker (`wrangler dev seed/seed.ts`) and hit it once, or
- Upload each file directly: `wrangler r2 object put portfolio-cms/data/entries.json --file=seed/entries.json` (repeat per file, using the key from `R2_KEYS` in `src/types.ts`).

## Environment variables

Set in `wrangler.toml` `[vars]` (non-secret) or as Worker secrets (sensitive):

| Variable              | Kind    | Purpose                                            |
| --------------------- | ------- | --------------------------------------------------- |
| `ENVIRONMENT`         | var     | `development` / `production` marker                 |
| `ALLOWED_ORIGIN_DEV`  | var     | CORS origin allowed in dev (Vite dev server)        |
| `ALLOWED_ORIGIN_PROD` | var     | CORS origin allowed in production                    |
| `ADMIN_USERNAME`      | secret  | Login username                                       |
| `ADMIN_PASSWORD_HASH` | secret  | `salt:hash` PBKDF2 string (see `generateHash()` in `src/auth.ts`) |
| `JWT_SECRET`          | secret  | HMAC signing secret for issued JWTs                  |

Real secret values, R2 bucket provisioning, and deployment are intentionally out of scope for
this repo's code — see the frontend's `portfolio-cms-r2-worker-prompt.md` "Deferred —
Configuration" section for that process.

## Consuming this from the frontend

Set `VITE_API_BASE_URL` in the frontend's `.env.local` to this Worker's URL (local `wrangler
dev` URL or the deployed Worker URL). With it empty, the frontend runs fully on
`localStorage` fallback data instead. All routes and response shapes here mirror
[`src/services/api.ts`](../src/services/api.ts) — if the two ever disagree, that file wins
and this Worker should be updated to match.
