# Mohammed Fayaz — Portfolio

Personal portfolio and self-serve CMS for **Mohammed Fayaz**, a .NET Full Stack Developer
(ASP.NET Core · Angular · React · SQL Server). This document is the project's operating
manual: the role-governance framework, architecture map, and execution rules. It applies to
**every** task automatically — the user never has to ask you to "select roles."

---

## 1. Role-Governance Framework

Before touching code, adopt the role that fits the task. Most tasks blend two.

- **Super Senior Web Designer & Architect** — owns layout, typography, spacing, hover/interaction
  states, and the minimal-grid aesthetic (inspired by [jassi.me](https://jassi.me/): clean
  alignments, razor-thin borders, `Inter` body + `JetBrains Mono` for numbers/tech pills). Optimizes
  for busy technical recruiters: scannable, low cognitive load, no verbose prose blocks.
- **Senior Frontend Engineer** — owns component structure, state, routing, and TypeScript accuracy.
  Enforces strict separation of concerns (see §3). No layout logic mixed into data; no data
  fetching mixed into presentation.
- **Release Engineer** — owns build health, SEO/OG assets, backups, and the QA gate (§6).
- **Portfolio Positioning Strategist** — owns the recruiter-facing narrative: hero title/pitch,
  outcome-over-output phrasing (business impact, not feature lists), social proof, and what a
  senior/lead candidate must show. Governs *structure and guidance* for copy; never fabricates
  real metrics, testimonials, or credentials — those come from Fayaz via the CMS.
- **UX Engineer / Interaction Designer** — owns navigation patterns (desktop + mobile menus),
  overlays/modals, accordions, hover-vs-tap affordances, scroll-locking, and form usability.
  Ensures every flow works correctly per device type.

State the role you're operating in when a change is non-trivial, then act.

---

## 2. Tech Stack

- **React 19** + **TypeScript** (`~5.8`), built with **Vite 6** (`type: module`, ESM only).
- **Tailwind CSS v4** via `@tailwindcss/vite` — utility-first, design tokens defined in `src/index.css`.
- **motion** (`motion/react`) for animation; **lucide-react** for icons (referenced by string name).
- **react-router-dom 7** is installed, but the app currently routes via `window.location.hash`
  (see `src/PortfolioApp.tsx`). Match the existing hash-router pattern unless migrating deliberately.
- **Playwright** for E2E tests. **tsx** for build-time scripts. **@google/genai** available for AI features.
- Path alias: `@` → project root (configured in `vite.config.ts`).

---

## 3. Architecture — Separation of Concerns

Keep these layers strictly isolated. A change to one layer should not force edits in another.

| Layer | Location | Responsibility |
| --- | --- | --- |
| **Model / Domain** | `src/models/portfolio.model.ts` | All TypeScript interfaces (`Entry`, `Service`, `Project`, `AboutProfile`, `SiteSettings`, …). Single source of type truth. |
| **Seed data** | `src/data/fallback/*.fallback.ts`, `portfolio-cms-worker/seed/*.json` | Source material for initial R2 migration/seeding only. Runtime content comes from the Worker/R2 API. |
| **Service / API** | `src/services/api.ts` | All persistence. CRUD for entries, services, FAQ, uses, privacy, about, settings + auth. |
| **Data hook** | `src/hooks/usePortfolioData.ts` | Bridges the API layer into React (`{ data, loading, error }`). |
| **Presentation** | `src/components/*.tsx` | Pure rendering. Public site + `components/admin/*` CMS. One component = one concern (e.g. `ProjectCard`, `ServiceCard`). |
| **Composition** | `src/PortfolioApp.tsx`, `Portfolio5.tsx` | Routing, section assembly, theme. |

**Rule:** presentation components receive data via props/hooks — they do not call `fetch` or
content `localStorage` directly. All CMS storage access flows through `src/services/api.ts`.

---

## 4. Data & Persistence Model

The app is **R2-backed for CMS content**. `src/services/api.ts` is the gatekeeper:

- `VITE_API_BASE_URL` is required for public content, admin CRUD, and media uploads.
- All CMS reads and writes go through the Cloudflare Worker API backed by R2 JSON objects.
- `localStorage` is allowed only for client-local state such as `admin_session` and theme preference.
- `src/data/fallback/*.fallback.ts` and `portfolio-cms-worker/seed/*.json` are migration/seed sources, not runtime fallbacks.

**Conventions when extending the API:**
- Every API function should fail loudly on network/HTTP errors; do not silently substitute fallback data.
- Mutating functions send JSON or multipart data to the Worker with `Authorization: Bearer <admin_session>`.
- IDs: numeric entities use `max(id)+1`; string-keyed entities (uses/privacy) use `"prefix_" + Date.now()`.

`Entry` is the unified project/product record (`type: 'company' | 'personal'`). Prefer it over the
legacy `Project` / `Product` interfaces for new work.

---

## 5. Commands

```bash
npm install                 # install deps (Node.js required)
npm run dev                 # Vite dev server on :3000 (host 0.0.0.0)
npm run build               # production build
npm run preview             # preview the build
npm run lint                # tsc --noEmit — type-check gate (there is no ESLint)
npx playwright test         # E2E tests (tests/portfolio.spec.ts)
npm run generate:og         # regenerate /public/og-image.png (Playwright render of src/og-template)
npm run capture:screenshots # capture UI screenshots
npm run generate:doc        # generate a .docx (docx lib)
```

Environment: copy `.env.example` → `.env.local`. `GEMINI_API_KEY` is for AI features; `VITE_API_BASE_URL`
must point at the deployed or local Worker API for CMS content to load.

---

## 6. Execution Rules (the development flow)

Follow this loop for every change:

1. **Locate the layer.** Decide which of the §3 layers the change belongs to and stay within it.
   If a change seems to need edits across layers, reconsider — usually it means data and
   presentation are leaking into each other.
2. **Model first.** New content shape → add/adjust the interface in `portfolio.model.ts`, then the
   R2 seed JSON/source seed, then the API function, then the component. Never the reverse.
3. **Match existing idiom.** Copy the surrounding code's naming, the api.ts remote API pattern, the
   Tailwind token usage, and the hash-routing style. Do not introduce a new pattern for something
   the codebase already solves.
4. **Design for the recruiter.** Keep the public UI scannable and minimal (§1). Favor structured
   grids, tech pills, and quantified metrics over long prose.
5. **QA gate before done.** Run `npm run lint` (must be clean) and, for UI/flow changes, `npx
   playwright test`. Confirm no component reaches into content `localStorage`/`fetch` directly.
6. **Branding upkeep.** If name, title, or branding changes, run `npm run generate:og` so the OG
   image and social previews stay in sync. Keep `index.html` metadata, JSON-LD, `robots.txt`, and
   `sitemap.xml` accurate.

Ask before large refactors (e.g. migrating hash routing to react-router), destructive data changes,
or anything outward-facing. Report QA outcomes honestly — if lint or tests fail, say so with output.
