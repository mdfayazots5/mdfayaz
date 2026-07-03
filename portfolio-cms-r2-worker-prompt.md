# Portfolio CMS — Cloudflare R2 + Workers Backend

## Phase-wise Build Prompt for Codex (code development only)

> **How to use this document:** Build the Worker **one phase at a time, in order**. Each phase lists
> its goal, the exact files to create, the spec, and a **Definition of Done**. Do not start a phase
> until the previous phase's Definition of Done is met. **This document covers CODE DEVELOPMENT
> ONLY.** Everything about secrets, real origins, R2 bucket provisioning, and deployment is in the
> final **"Deferred — Configuration"** section — do NOT do any of that now. Use safe placeholders
> where a real value would otherwise be needed.

> **Contract source of truth (read before every phase):** This Worker is a drop-in backend for an
> existing **React 19 + Vite** frontend. Its request/response contract is defined by two files in
> this repo:
> - [`src/services/api.ts`](src/services/api.ts) — exact routes, methods, payloads, token handling.
> - [`src/models/portfolio.model.ts`](src/models/portfolio.model.ts) — exact data shapes.
>
> If anything in this prompt ever disagrees with those two files, **those files win.** Do not invent
> routes, wrappers, slugs, or field names.

---

## Ground Rules (apply to every phase)

1. **Zero runtime dependencies.** Dev deps only: `wrangler`, `typescript`, `@cloudflare/workers-types`.
2. **Workers-compatible APIs only** — Web Crypto (`crypto.subtle`), `crypto.randomUUID`,
   TextEncoder/Decoder, atob/btoa, fetch, Request, Response. No `crypto`/`Buffer`/`fs`/`path`.
3. **Bare bodies, never envelopes.** `GET /entries` returns a bare `Entry[]`; `GET /about` returns a
   bare `AboutProfile`; `POST`/`PUT` return the bare created/updated entity. The client reads the
   parsed body directly — an `{ success, data }` wrapper would break it.
4. **IDs:** numeric `max(id)+1` for entries/services/faq; `` `${prefix}_${Date.now()}` `` for
   uses (`cat_`, `item_`) and privacy (`priv_`). **No slugs anywhere.**
5. **Public reads, authenticated writes.** All GET routes are unauthenticated. All POST/PUT/DELETE
   require a valid Bearer JWT.
6. **Every R2 op / JSON.parse / auth check wrapped in try-catch** with a meaningful message.
7. **TypeScript strict, no `any`.** 2-space indent, single quotes, semicolons, trailing commas,
   complete code (no TODOs, no placeholder functions).
8. **No `/api` prefix, no `/admin` segment.** The client calls flat paths off the base URL:
   `/entries`, `/services`, `/faq`, `/uses`, `/privacy`, `/about`, `/settings`.
9. **Do NOT build separate `projects`/`products` collections.** Work items are one unified `Entry`
   collection (`type: 'company' | 'personal'`).

---

## Target Structure (the finished tree)

```
portfolio-cms-worker/
├── wrangler.toml
├── package.json
├── tsconfig.json
├── .dev.vars                    (placeholder secrets — .gitignored)
├── .gitignore
├── README.md
├── src/
│   ├── index.ts                 (router)
│   ├── types.ts                 (interfaces transcribed from portfolio.model.ts)
│   ├── auth.ts                  (JWT + PBKDF2, Web Crypto only)
│   ├── cors.ts
│   ├── response.ts
│   ├── middleware/
│   │   └── auth-guard.ts
│   ├── handlers/
│   │   ├── auth.handler.ts
│   │   ├── entries.handler.ts
│   │   ├── services.handler.ts
│   │   ├── faq.handler.ts
│   │   ├── uses.handler.ts
│   │   ├── privacy.handler.ts
│   │   ├── about.handler.ts
│   │   ├── settings.handler.ts
│   │   └── upload.handler.ts
│   └── utils/
│       ├── id.ts
│       └── validator.ts
└── seed/
    ├── seed.ts
    ├── entries.json
    ├── services.json
    ├── about.json
    ├── faq.json
    ├── uses.json
    ├── privacy.json
    └── site-settings.json
```

---

# PHASE 1 — Scaffold & Local Config

**Goal:** Create the project skeleton so TypeScript compiles. Use placeholders only — no real
secrets or origins.

**Files:**

`package.json` — name `portfolio-cms-api`, `"type": "module"`, scripts `dev` (`wrangler dev`),
`deploy` (`wrangler deploy`), `typecheck` (`tsc --noEmit`). Dev deps only (see Ground Rule 1).

`tsconfig.json` — strict mode on, `target`/`module` `ES2022`, `moduleResolution` `Bundler`,
`types: ["@cloudflare/workers-types"]`, `noEmit: true`.

`wrangler.toml`:
```toml
name = "portfolio-cms-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
ENVIRONMENT = "development"
ALLOWED_ORIGIN_PROD = "https://REPLACE_ME.example.com"   # set during Configuration phase
ALLOWED_ORIGIN_DEV  = "http://localhost:3000"            # Vite dev server (NOT :4200)

[[r2_buckets]]
binding = "CMS_BUCKET"
bucket_name = "portfolio-cms"
preview_bucket_name = "portfolio-cms-dev"
```

`.gitignore`:
```
node_modules/
dist/
.dev.vars
.wrangler/
```

`.dev.vars` (placeholders — real values come later):
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=REPLACE_ME_IN_CONFIG_PHASE
JWT_SECRET=REPLACE_ME_IN_CONFIG_PHASE
```

**Definition of Done:** `npm install` succeeds and `npx tsc --noEmit` runs (no source files yet, so
it passes trivially). No real credentials committed.

---

# PHASE 2 — Types (`src/types.ts`)

**Goal:** One typed source for every shape. **Transcribe verbatim** from
[`src/models/portfolio.model.ts`](src/models/portfolio.model.ts) — do not redesign.

Include: `Env`, `Entry`, `Service`, `FaqItem`, `AboutProfile`, `UsesItem`, `UsesCategory`,
`PrivacySection`, `SiteSettings`, `LoginRequest`, `LoginResponse`, and the `R2_KEYS` const.

```typescript
export interface Env {
  CMS_BUCKET: R2Bucket;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  ALLOWED_ORIGIN_PROD: string;
  ALLOWED_ORIGIN_DEV: string;
}

export interface Entry {
  id: number;
  type: 'company' | 'personal';
  title: string;
  tagline: string;
  categoryTag: string;
  description: string;
  features: string[];
  tech: string[];
  achievements: string[];
  companyName?: string;
  role?: string;
  teamSize?: number;
  startDate?: string;
  endDate?: string;
  status?: 'Live' | 'In Development' | 'Private Beta' | 'Completed';
  audience?: string;
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  videoUrl?: string;
  coverImage?: string;
  icon: string;
  color: string;
  featured: boolean;
  displayOrder: number;
}

export interface Service {
  id: number;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  icon: string;
  status: 'Active' | 'Inactive';
  displayOrder: number;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface AboutProfile {
  tagline: string;
  architectBio: string;
  leadBio: string;
  developerBio: string;
  skills: { category: string; items: string[] }[];
  experienceTimeline: { company: string; role: string; period: string; description: string }[];
}

export interface UsesItem { id: string; name: string; description: string; tag?: string; }
export interface UsesCategory { id: string; name: string; subtitle?: string; items: UsesItem[]; }

export interface PrivacySection { id: string; title: string; body: string; }

export interface SiteSettings {
  name: string;
  role: string;
  location: string;
  availability: string;
  openToRelocation: boolean;
  yearsExperience: string;
  blog: string;
  contactEmail: string;
  socialLinks: { github: string; linkedin: string; dob: string; mobile: string; };
  resumeUrl: string;
  tagline: string;
}

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; expiresAt: string; }

export const R2_KEYS = {
  ENTRIES:  'data/entries.json',
  SERVICES: 'data/services.json',
  ABOUT:    'data/about.json',
  FAQ:      'data/faq.json',
  USES:     'data/uses.json',
  PRIVACY:  'data/privacy.json',
  SETTINGS: 'data/site-settings.json',
} as const;
```

**Definition of Done:** `tsc --noEmit` clean. Field names match `portfolio.model.ts` exactly.

---

# PHASE 3 — Utilities (`src/utils/`)

**Goal:** ID generation and validation primitives.

`src/utils/id.ts`
- `nextNumericId(items: { id: number }[]): number` → `max(id)+1`, or `1` if empty.
- `prefixedId(prefix: string): string` → `` `${prefix}_${Date.now()}` ``.

`src/utils/validator.ts`
- `isNonEmptyString(v: unknown): boolean`
- `isPositiveNumber(v: unknown): boolean`
- `validateRequired(obj: Record<string, unknown>, fields: string[]): string | null` → first missing
  field name, else `null`.

**Definition of Done:** Pure functions, no side effects, `tsc` clean. No slug utility exists.

---

# PHASE 4 — Response Helpers & CORS (`src/response.ts`, `src/cors.ts`)

**Goal:** Consistent JSON responses with CORS headers.

`src/cors.ts`
- `corsHeaders(request: Request, env: Env): Record<string, string>` — echo the origin if it matches
  `ALLOWED_ORIGIN_DEV` or `ALLOWED_ORIGIN_PROD`.
- `handlePreflight(request: Request, env: Env): Response | null` — return a 204 for `OPTIONS`, else
  `null`.
- Methods `GET, POST, PUT, DELETE, OPTIONS`; headers `Content-Type, Authorization`; `Max-Age 86400`.

`src/response.ts`
- `jsonResponse<T>(request: Request, env: Env, body: T, status = 200): Response` — serialize the
  **bare** value, attach CORS + `Content-Type: application/json`.
- `errorResponse(request: Request, env: Env, message: string, status: number): Response` — body
  `{ message }`.
- `notFoundResponse(request: Request, env: Env, resource?: string): Response` — 404.

**Definition of Done:** All helpers attach CORS headers. Reads/writes serialize bare values (no
envelope). `tsc` clean.

---

# PHASE 5 — Auth (`src/auth.ts`, `src/middleware/auth-guard.ts`)

**Goal:** Username/password login → JWT; guard for mutating routes. Web Crypto only.

`src/auth.ts`
- `hashPassword(password: string): Promise<string>` — PBKDF2 + SHA-256, 100000 iterations, 256-bit
  key; return a self-describing string (e.g. `salt:hash`, both base64).
- `verifyPassword(password: string, stored: string): Promise<boolean>`.
- `createJwt(env: Env): Promise<{ token: string; expiresAt: string }>` — manual
  `header.payload.signature`, HMAC-SHA256, payload `{ sub: 'admin', iat, exp }`, 24h expiry.
- `verifyJwt(token: string, env: Env): Promise<boolean>` — check signature + `exp`.
- `login(body: LoginRequest, env: Env): Promise<LoginResponse | null>` — `username ===
  env.ADMIN_USERNAME` **and** `verifyPassword` passes → `createJwt`; else `null`.
- Export a one-time helper `generateHash(password)` (dev-only utility to print a hash for the
  Configuration phase).

> **Token key must be literally `token`** — `api.ts` reads `data.token` first.

`src/middleware/auth-guard.ts`
- `requireAuth(request: Request, env: Env): Promise<boolean>` — parse
  `Authorization: Bearer <token>`, return `verifyJwt` result; `false` if header missing/malformed.

**Definition of Done:** No Node built-ins used. Login returns `{ token, expiresAt }`. Guard returns
boolean. `tsc` clean.

---

# PHASE 6 — Handlers (`src/handlers/`)

**Goal:** One handler module per resource. Storage = one JSON file per collection in R2 (`R2_KEYS`);
read-modify-write the whole array/object per mutation. Wrap all R2/JSON in try-catch.

**Shared R2 helpers** (put in a small module, e.g. inline in each handler or a `store.ts`):
- `readJson<T>(env, key, fallback: T): Promise<T>` — `env.CMS_BUCKET.get(key)`; parse; return
  `fallback` if missing.
- `writeJson<T>(env, key, value: T): Promise<void>` — `env.CMS_BUCKET.put(key, JSON.stringify(value))`.

### 6a. `auth.handler.ts`
`POST /auth/login` → parse `LoginRequest`, call `login()`, return `LoginResponse` or 401.

### 6b. `entries.handler.ts` (collection: `R2_KEYS.ENTRIES`)
- `GET /entries` → return full `Entry[]` as-is (no visibility filter, no re-sort — the React client
  filters/sorts). `[]` if missing.
- `POST /entries` → validate required (`type`, `title`, `description`); `id = nextNumericId`; default
  `displayOrder=id`, `icon='Briefcase'`, `color='#0EA5E9'`, and array fields to `[]`; append; return
  created `Entry`.
- `PUT /entries/:id` → find by numeric id, `{ ...existing, ...body }`, preserve `id`, write; 404 if
  absent.
- `DELETE /entries/:id` → filter out; return `{ success: true }`.

### 6c. `services.handler.ts` (collection: `R2_KEYS.SERVICES`)
Same CRUD shape. Defaults on create: `status='Active'`, `icon='Server'`, `displayOrder=id`,
`highlights=[]`.

### 6d. `faq.handler.ts` (collection: `R2_KEYS.FAQ`)
Same CRUD shape. `FaqItem` fields only (`question`, `answer`, `category`); numeric id.

### 6e. `uses.handler.ts` (collection: `R2_KEYS.USES`, an `UsesCategory[]`)
- `GET /uses` → full array.
- `POST /uses` → category; `id = prefixedId('cat')`; ensure `items: []`.
- `PUT /uses/:id`, `DELETE /uses/:id` → by category id.
- `POST /uses/:categoryId/items` → item; `id = prefixedId('item')`; push into that category.
- `PUT /uses/:categoryId/items/:itemId`, `DELETE /uses/:categoryId/items/:itemId`.

### 6f. `privacy.handler.ts` (collection: `R2_KEYS.PRIVACY`, a `PrivacySection[]`)
- `GET /privacy` → full array.
- `POST /privacy` → `id = prefixedId('priv')`.
- `PUT /privacy/:id`, `DELETE /privacy/:id`.
- `POST /privacy/reorder` with `{ orderedIds: string[] }` → rebuild in that order, appending any ids
  not listed (fail-safe). Mirror `reorderPrivacySections()` in `api.ts`.

### 6g. `about.handler.ts` (single object: `R2_KEYS.ABOUT`)
- `GET /about` → object (seed default if missing).
- `PUT /about` → replace whole object; return `{ success: true }`.

### 6h. `settings.handler.ts` (single object: `R2_KEYS.SETTINGS`)
- `GET /settings` → object (seed default if missing).
- `PUT /settings` → replace whole object; return `{ success: true }`.

### 6i. `upload.handler.ts`
- `POST /upload` → multipart; allow jpg/jpeg/png/webp/gif/svg/pdf; max 5MB; key
  `assets/{category}/{timestamp}-{name}`; store with correct content-type; return `{ url }`.
- `DELETE /upload/:key` → `env.CMS_BUCKET.delete(key)`.

**Definition of Done:** Every handler returns bare entities/arrays. Reads never strip data. IDs
follow Ground Rule 4. `tsc` clean.

---

# PHASE 7 — Router (`src/index.ts`)

**Goal:** Zero-dependency manual router wiring the exact route table below (paths are relative to
`VITE_API_BASE_URL`).

```
PUBLIC (no auth):
  GET    /health
  POST   /auth/login
  GET    /entries
  GET    /services
  GET    /faq
  GET    /uses
  GET    /privacy
  GET    /about
  GET    /settings

AUTH REQUIRED (Bearer JWT):
  POST   /entries              PUT /entries/:id              DELETE /entries/:id
  POST   /services             PUT /services/:id             DELETE /services/:id
  POST   /faq                  PUT /faq/:id                  DELETE /faq/:id
  POST   /uses                 PUT /uses/:id                 DELETE /uses/:id
  POST   /uses/:categoryId/items
  PUT    /uses/:categoryId/items/:itemId
  DELETE /uses/:categoryId/items/:itemId
  POST   /privacy              PUT /privacy/:id              DELETE /privacy/:id
  POST   /privacy/reorder
  PUT    /about
  PUT    /settings
  POST   /upload               DELETE /upload/:key
```

Flow: (1) `handlePreflight` for OPTIONS; (2) match method + pathname; (3) if the route is mutating,
`requireAuth` → 401 on failure; (4) dispatch to the handler; (5) top-level try-catch → 500 via
`errorResponse`. Default export `{ fetch(request, env, ctx) }`.

**Definition of Done:** Every path/method above is reachable and matches `api.ts`. No `/api`, no
`/admin`, no `/reorder` for entries/services/faq, no slug reads. `tsc` clean.

---

# PHASE 8 — Seed Data & Script (`seed/`)

**Goal:** Initial R2 content identical to the app's local fallback, so remote and local start the
same.

**Transcribe each seed JSON from the matching fallback module** (do not hand-write new content):

| Seed file | Source module |
| --- | --- |
| `seed/entries.json` | `src/data/fallback/entries.fallback.ts` |
| `seed/services.json` | `src/data/fallback/services.fallback.ts` |
| `seed/about.json` | `src/data/fallback/about.fallback.ts` |
| `seed/faq.json` | `src/data/fallback/faq.fallback.ts` |
| `seed/uses.json` | `src/data/fallback/uses.fallback.ts` |
| `seed/privacy.json` | `src/data/fallback/privacy.fallback.ts` |
| `seed/site-settings.json` | `src/data/fallback/settings.fallback.ts` |

Each file must validate against its Phase 2 interface. (Ignore legacy `projects.fallback.ts` /
`products.fallback.ts` — superseded by `entries.fallback.ts`.)

`seed/seed.ts` — read each seed JSON and `put` it to R2 under its `R2_KEYS` value; idempotent
(safe to re-run). Runnable via the R2 binding or `wrangler r2 object put`.

**Definition of Done:** Seven JSON files present and type-valid; script writes all keys.

---

# PHASE 9 — README (`README.md`)

**Goal:** Document the code (not deployment specifics, which are deferred).

Cover: architecture (ASCII), the full Phase 7 route table with shapes, local `wrangler dev`, how to
seed, and env-var reference. State clearly that the frontend consumes this by setting
`VITE_API_BASE_URL` to the Worker URL, and that all routes/shapes mirror
[`src/services/api.ts`](src/services/api.ts).

**Definition of Done:** A new reader can run and understand the Worker from the README alone.

---

# DEFERRED — Configuration (DO NOT DO NOW)

Leave these for after all code phases pass. They are called out so Codex does **not** attempt them
during development:

- Generating the real `ADMIN_PASSWORD_HASH` and `JWT_SECRET`; setting them as Cloudflare secrets.
- Replacing `ALLOWED_ORIGIN_PROD` (`REPLACE_ME.example.com`) with the real production domain.
- Creating the R2 buckets (`portfolio-cms`, `portfolio-cms-dev`) in the Cloudflare account.
- Running `seed/seed.ts` against a live bucket.
- `wrangler deploy` and DNS/custom-domain wiring.
- Setting `VITE_API_BASE_URL` in the frontend `.env.local` to the deployed Worker URL.

---

## Start Now

Begin at **Phase 1** and stop at each **Definition of Done** to confirm before continuing. Before
writing any handler in Phase 6, open [`src/services/api.ts`](src/services/api.ts) and confirm the
exact URL and payload for that resource, then implement to match.
