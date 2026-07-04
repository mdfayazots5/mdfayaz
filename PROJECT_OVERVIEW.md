# Project Overview

## Purpose

This repository contains Mohammed Fayaz's personal portfolio website and a self-serve CMS used to manage portfolio content. Portfolio content is served through a Cloudflare Worker API backed by Cloudflare R2 JSON files.

The public site presents profile, work entries, services, FAQ, privacy, uses, and contact-oriented portfolio content. The admin area lets the site owner manage the content without editing source files.

## High-Level Stack

- Frontend: React 19, TypeScript, Vite 6, Tailwind CSS v4
- Routing: hash-based routing in `src/PortfolioApp.tsx`
- Animation/scrolling: `motion/react` and Lenis
- Icons: `lucide-react`, referenced by icon name strings in data
- Testing: Playwright E2E tests and TypeScript type-checking
- Backend: Cloudflare Worker, TypeScript, Wrangler
- Backend storage: Cloudflare R2, with one JSON object per content collection

## Repository Layout

```text
.
|-- src/
|   |-- PortfolioApp.tsx              # Main app composition and hash router
|   |-- main.tsx                      # React entry point
|   |-- index.css                     # Tailwind v4 import, theme tokens, global styles
|   |-- models/portfolio.model.ts     # Frontend domain model contracts
|   |-- services/api.ts               # Frontend persistence and API adapter
|   |-- hooks/usePortfolioData.ts     # Loads entries into public portfolio data
|   |-- components/                   # Public site and shared UI components
|   |-- components/admin/             # Admin CMS screens and forms
|   |-- data/fallback/                # Source seed data used for R2 migration/seeding
|   |-- og-template/                  # Template used for Open Graph image generation
|-- portfolio-cms-worker/
|   |-- src/index.ts                  # Worker router
|   |-- src/handlers/                 # Resource handlers
|   |-- src/utils/                    # R2 store, validation, IDs, rate limiting
|   |-- src/middleware/auth-guard.ts  # JWT auth guard for mutations
|   |-- seed/                         # R2 seed JSON files
|   |-- wrangler.toml                 # Worker/R2 config
|-- tests/portfolio.spec.ts           # Playwright smoke/E2E tests
|-- scripts/                          # Screenshot, OG image, and DOCX generation
|-- public/                           # Static public assets and SEO files
|-- screenshots/                      # Captured UI states
|-- README.md                         # Original AI Studio run notes
|-- CLAUDE.md                         # Detailed development operating manual
```

## Frontend Architecture

The frontend is intentionally layered so content, storage, and presentation stay separate.

- Models live in `src/models/portfolio.model.ts`.
- Source seed data lives in `src/data/fallback/*.fallback.ts` and is used for R2 migration/seeding.
- The storage/API boundary lives in `src/services/api.ts`.
- React data loading lives in `src/hooks/usePortfolioData.ts`.
- Public rendering lives mostly in `src/components/*.tsx`.
- Admin CMS rendering lives in `src/components/admin/*.tsx`.
- App routing and top-level composition live in `src/PortfolioApp.tsx`.

The app currently uses `window.location.hash` instead of `react-router-dom`, even though `react-router-dom` is installed. Public routes and admin routes should follow the existing hash-router pattern unless a routing migration is planned deliberately.

## Main Runtime Flow

1. `src/main.tsx` mounts `PortfolioApp`.
2. `PortfolioApp` wraps the app in Lenis smooth scrolling and `ThemeProvider`.
3. `PortfolioRouter` reads `window.location.hash` and decides whether to render the public portfolio, admin login, or admin CMS.
4. Public portfolio data is loaded through `usePortfolioData(5)`.
5. `usePortfolioData` calls `/entries`, `/settings`, and `/about` through `src/services/api.ts`.
6. Loaded entries, site settings, and about/profile content are assembled into the public portfolio shell and rendered through `Portfolio5`.

## Content And Persistence Model

`src/services/api.ts` is the frontend's single persistence gateway.

`VITE_API_BASE_URL` is required for CMS content:

- Public GET requests read from the configured Worker API.
- Admin mutations send authenticated requests with `Authorization: Bearer <token>`.
- Uploads go to the Worker `/upload` endpoint and return public R2 media URLs.
- The app does not silently substitute fallback/local content when the backend is unavailable.

Core content types include:

- `Entry`: unified work/product record for company and personal projects
- `Service`: services displayed on the public services page
- `FaqItem`: FAQ content
- `UsesCategory`: tools/uses content
- `PrivacySection`: privacy page sections
- `AboutProfile`: profile narrative and timeline content
- `SiteSettings`: identity, contact links, resume URL, and admin-managed media

## Admin CMS Routes

Admin routes are hash-based:

- `#admin/login`
- `#admin`
- `#admin/entries`
- `#admin/entries/new`
- `#admin/entries/:id/edit`
- `#admin/services`
- `#admin/faq`
- `#admin/uses`
- `#admin/privacy`
- `#admin/about`
- `#admin/settings`
- `#admin/media`

Authentication state is stored in `localStorage` under `admin_session`.

## Cloudflare Worker CMS

The Worker in `portfolio-cms-worker` mirrors the frontend data model and API expectations. It has no runtime dependencies and stores content in R2 JSON objects.

Important files:

- `portfolio-cms-worker/src/index.ts`: route table and request dispatch
- `portfolio-cms-worker/src/types.ts`: backend copies of frontend content contracts and R2 keys
- `portfolio-cms-worker/src/auth.ts`: password hashing and JWT logic
- `portfolio-cms-worker/src/middleware/auth-guard.ts`: auth protection for mutating routes
- `portfolio-cms-worker/src/handlers/*.handler.ts`: resource-specific CRUD handlers
- `portfolio-cms-worker/src/utils/store.ts`: R2 JSON read/write helper
- `portfolio-cms-worker/seed/*.json`: initial seed data

R2 object keys:

- `data/entries.json`
- `data/services.json`
- `data/faq.json`
- `data/uses.json`
- `data/privacy.json`
- `data/about.json`
- `data/site-settings.json`

Public API routes include:

- `GET /health`
- `POST /auth/login`
- `GET /entries`
- `GET /services`
- `GET /faq`
- `GET /uses`
- `GET /privacy`
- `GET /about`
- `GET /settings`

Authenticated mutation routes include create/update/delete endpoints for entries, services, FAQ, uses, privacy, about, settings, and media upload/delete.

## Environment Variables

Frontend `.env.local` values:

```text
GEMINI_API_KEY=
APP_URL=
VITE_API_BASE_URL=
VITE_ADMIN_USERNAME=
VITE_ADMIN_PASSWORD=
```

Worker variables/secrets:

- `ENVIRONMENT`
- `ALLOWED_ORIGIN_DEV`
- `ALLOWED_ORIGIN_PROD`
- `R2_PUBLIC_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`

## Common Commands

Frontend:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npx playwright test
npm run generate:og
npm run capture:screenshots
npm run generate:doc
```

Worker:

```bash
cd portfolio-cms-worker
npm install
npm run dev
npm run typecheck
npm run deploy
```

## Testing And Quality Gates

- `npm run lint` runs `tsc --noEmit`.
- `npx playwright test` runs browser tests against the Vite dev server.
- Existing Playwright coverage verifies that seeded identity and work entries render.
- For UI changes, update or capture screenshots when visual state matters.
- For branding or metadata changes, regenerate Open Graph assets with `npm run generate:og`.

## Development Conventions

- Keep CMS storage access inside `src/services/api.ts`; presentation components should not call `fetch` or content `localStorage` directly.
- Add or change data shape in this order: model, R2 seed/source seed, API adapter, component.
- Prefer the unified `Entry` type for new project/product work.
- Keep the frontend and Worker contracts aligned; if they disagree, treat `src/services/api.ts` and `src/models/portfolio.model.ts` as the source of truth.
- Preserve the existing hash-routing approach unless intentionally migrating the router.
- Use Tailwind tokens and CSS variables from `src/index.css` instead of hardcoded one-off design systems.
- Do not commit real secrets. Use `.env.local`, Worker secrets, or local Wrangler dev vars as appropriate.

## Current Notes

- The root `README.md` still contains generic AI Studio instructions; `CLAUDE.md` has the more accurate development manual.
- `react-router-dom` is installed but not currently used for routing.
- The Worker README describes the API contract in more detail.
- The public portfolio shell is assembled from R2-backed `/entries`, `/settings`, and `/about`; there is no longer a `portfolio.mock.ts` content fallback.
- The repo contains generated artifacts such as `dist`, `screenshots`, `test-results`, and a DOCX audit file.
