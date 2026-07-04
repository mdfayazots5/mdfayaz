# Task: Live R2 Data Binding + Admin Media (Background & Profile Images)

**For:** Codex implementation. Follow `CLAUDE.md` (role governance, §3 separation of concerns,
§4 api.ts fallback pattern, §6 execution flow). **Model → fallback → api → hook → component.**

This document is the single source of work. It has two independent features:
- **Feature A** — Make the deployed site read from the Cloudflare R2 backend (no dummy data), with a loader.
- **Feature B** — Manage a hero **background image** and **profile picture** from Admin (upload + crop + size validation), shown on the public portfolio, working on desktop and mobile.

---

## Background (current state)

- Frontend is backend-optional. `src/services/api.ts` reads `VITE_API_BASE_URL`. When it is empty
  **or** a request fails, every getter silently substitutes `src/data/fallback/*` (dummy/seed) data.
  That is why the console shows: *"VITE_API_BASE_URL is empty/undefined. Sourcing entries from
  localStorage / fallback data."*
- The R2 backend already exists in `portfolio-cms-worker/` (routes: `/entries`, `/services`, `/faq`,
  `/uses`, `/privacy`, `/about`, `/settings`, `/upload`, `/auth/login`). `POST /upload` takes a
  multipart form (`file`, `category`), enforces a 5 MB limit and an image/pdf allow‑list, and returns
  `{ url }` pointing at the R2 public bucket.
- The deployed site is `https://mdfayaz.pages.dev/`.

---

# FEATURE A — Bind live data from R2 (no dummy data + loader)

### A1. Deployment / configuration (prerequisite — without this, nothing binds)
- Deploy `portfolio-cms-worker/` and **seed R2 with the real content** (use `seed/seed.ts`; the seed
  JSON currently mirrors the fallback files — replace placeholder content with the real content first).
- In `portfolio-cms-worker/wrangler.toml`, set `ALLOWED_ORIGIN_PROD = "https://mdfayaz.pages.dev"`
  (currently a localhost placeholder). Without this the browser blocks every request via CORS.
- Set real Worker secrets (`JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_USERNAME`) — never in `[vars]`.
- In **Cloudflare Pages** project settings, set the build env var **`VITE_API_BASE_URL`** to the
  deployed Worker URL, and redeploy. (Vite inlines it at build time — a rebuild is required.)
- Confirm `R2_PUBLIC_URL` in `wrangler.toml` points at the public R2 bucket so uploaded image URLs load.

### A2. Change api.ts so a configured backend is the source of truth (no silent dummy fallback)
- **Keep** the fallback path **only** for local dev when `VITE_API_BASE_URL` is empty (so `npm run dev`
  still works offline). Preserve the existing api.ts closure/short‑circuit idiom from CLAUDE.md §4.
- **When `VITE_API_BASE_URL` is set:** on a successful response, bind exactly what the API returns —
  including an empty array/object. On a **network/error** response, do **not** substitute
  `*.fallback.ts` content; instead surface an error so the UI can show a proper error/retry state.
- An empty result from the API must render an **empty state** ("No projects yet", etc.), **never** the
  seeded dummy content. The `*.fallback.ts` files remain the local-dev seed only.
- Remove/quiet the "Sourcing from localStorage / fallback" `console.warn` when a backend is configured
  (it should only appear in local-dev-no-backend mode).

### A3. Loaders on every data-driven view (good first impression)
- `usePortfolioData` already exposes `{ data, loading, error }`. Ensure the shell shows the existing
  `LoadingScreen` (or a lighter skeleton) while `loading` is true, and an error/retry state on `error`.
- The section components that fetch their **own** data directly through api.ts getters
  (`UsesPage`, `FaqPage`, `PrivacyPage`, `ServicesPage`, `ProductsPage`, About/Settings consumers)
  must each show a **loading state** (skeleton or spinner) instead of flashing dummy data, then the
  real data or an empty state. Keep it consistent (one shared loader/skeleton style).
- Recommended: a lightweight skeleton for lists/cards; reserve the full `LoadingScreen` for the
  initial app boot. Match the minimal aesthetic (thin borders, `Inter`/`JetBrains Mono`).

### A4. Acceptance (Feature A)
- With `VITE_API_BASE_URL` set, the console no longer prints the fallback warning.
- Public pages show a loader, then **only** R2 content; empty collections show an empty state, not dummy data.
- A simulated API failure shows an error/retry state (not dummy data).
- With `VITE_API_BASE_URL` empty (local dev), the app still runs from fallback seed as before.

---

# FEATURE B — Admin-managed hero background + profile image (crop + validation, responsive)

Goal: from Admin, upload/replace a **profile picture** and a **hero background image** that render on the
public portfolio (the About hero is the target surface). Support an optional **separate mobile variant**
for each so cropping/framing looks right on both desktop and mobile.

### B1. Model first (CLAUDE.md §6.2)
- Extend the identity model with a media block. Put it on **`SiteSettings`** (site-wide identity) in
  both `src/models/portfolio.model.ts` and `portfolio-cms-worker/src/types.ts` so the shapes match.
- Suggested shape (optional fields, all URLs are R2 public URLs):
  - `profileImage`: `{ desktop?: string; mobile?: string }`
  - `heroBackground`: `{ desktop?: string; mobile?: string }`
  - If `mobile` is absent, the UI falls back to `desktop`. All optional — absence = current/no-image look.
- Update `src/data/fallback/settings.fallback.ts` and the Worker's `DEFAULT_SETTINGS`
  (`portfolio-cms-worker/src/handlers/settings.handler.ts`) with the new empty fields so old data
  without them still loads.
- No new API route needed: settings persist via the existing full-object `PUT /settings`; images upload
  via the existing `POST /upload` which returns `{ url }` to store in these fields.

### B2. Admin upload + crop + validation UI
- Add a **Media** section to `src/components/admin/AdminSettingsPage.tsx` (or a dedicated
  `AdminMediaPage` reachable from the sidebar — keep the existing admin layout/idiom, and remember the
  sidebar/bottom-nav is already wired in `AdminLayout.tsx`).
- For each of **Profile Image** and **Hero Background**, provide: current preview, an upload control,
  and a **Desktop / Mobile** toggle so the admin can set each variant separately (the "both editings"
  the brief mentions). If they only set Desktop, Mobile inherits it.
- **Cropper:** integrate an interactive crop before upload. Recommended library: **`react-easy-crop`**
  (small, touch-friendly, works in the admin on desktop and mobile). *This is a deliberately-approved
  new dependency for this feature* — otherwise CLAUDE.md's "no new deps" holds; do not add others.
  - Enforce sensible aspect ratios per slot: **profile ≈ 1:1** (square), **hero background ≈ 16:9
    desktop / ≈ 4:5 or 3:4 mobile** (portrait) so each variant frames correctly.
  - After cropping, export the cropped area to a compressed image blob (canvas → `image/webp` or
    `image/jpeg`) before upload.
- **Validation & size errors (must show clear messages):**
  - Reject non-images and anything the Worker rejects (allow `jpg/jpeg/png/webp`; **no SVG** — the
    Worker already blocks it).
  - Enforce a max file size that matches the Worker's **5 MB** limit; show an inline error toast/message
    like "Image exceeds 5 MB — please crop/compress" **before** attempting upload.
  - Optionally warn on too-small source dimensions (e.g. profile < 400×400) so quality stays good.
- **Upload flow:** send the cropped blob to `POST /upload` with a meaningful `category`
  (e.g. `profile`, `hero`), take the returned `{ url }`, write it into the matching
  `SiteSettings.profileImage/heroBackground` field, then `PUT /settings`. Use the existing admin toast
  pattern for success/error. Handle the delete/replace case (replacing an image just overwrites the URL).

### B3. Public rendering (desktop + mobile)
- Consume the new fields via the existing settings hook/getter in `src/components/AboutPage.tsx`:
  - **Hero background:** render `heroBackground` behind the hero (respect the existing `min-h-[78vh]
    lg:min-h-screen` hero and the `MF` watermark). Use the mobile variant under `md`, desktop at `md+`
    (e.g. via `<picture>`/`srcSet` or a CSS background swap). Add a subtle overlay/scrim so the name and
    subtitle stay legible over any photo, in **both light and dark** themes.
  - **Profile image:** render `profileImage` where a portrait belongs (the About section already has an
    image slot around the "About" block — reuse it). Square framing, `object-cover`, `max-w-full`,
    rounded per the design tokens.
  - If a field is empty, keep the current no-image appearance (graceful default) — never a broken image.
- Must be responsive and not cause horizontal scroll; images `max-w-full`, lazy-loaded.

### B4. Acceptance (Feature B)
- Admin can upload, **crop**, and save a profile image and a hero background, with independent
  desktop/mobile variants; oversized/invalid files show a clear inline error and are not uploaded.
- Saved images appear on the public About hero/profile, correct per breakpoint, legible in light & dark,
  no layout shift or horizontal scroll.
- Reloading pulls the images from R2 (URLs stored in settings) — not from local dummy data.

---

## Global constraints (from CLAUDE.md)
- Respect §3 layer separation: components never call `fetch`/`localStorage` directly — all storage
  access flows through `src/services/api.ts`; presentation receives data via props/hooks.
- Match existing idioms: the api.ts `executeLocal…()` + `useLocal` short‑circuit pattern, Tailwind v4
  design tokens in `src/index.css`, hash routing, the admin toast/layout patterns.
- Only one new dependency is authorized: the crop library (`react-easy-crop` recommended). No others.
- Keep the public UI recruiter-first: scannable, minimal, fast; add skeletons/loaders, not spinners everywhere.
- **QA gate before done:** `npm run lint` (tsc) must be clean; run `npx playwright test` for UI flows;
  `npm run build` must succeed. If name/branding changes, run `npm run generate:og`.
- If the profile/background belongs better on `AboutProfile` than `SiteSettings`, that's an acceptable
  alternative — but keep the frontend model and the Worker `types.ts` in sync either way.

## Suggested file touch-list
- `src/models/portfolio.model.ts`, `portfolio-cms-worker/src/types.ts` (model)
- `src/data/fallback/settings.fallback.ts`, `portfolio-cms-worker/src/handlers/settings.handler.ts` (defaults)
- `src/services/api.ts` (source-of-truth behavior, loaders/error, no dummy fallback when configured)
- `src/hooks/usePortfolioData.ts` + section pages (`UsesPage`, `FaqPage`, `PrivacyPage`, `ServicesPage`,
  `ProductsPage`) — loading/empty/error states
- `src/components/admin/AdminSettingsPage.tsx` (or new `AdminMediaPage` + `AdminLayout.tsx` entry) — upload/crop/validation
- `src/components/AboutPage.tsx` — render background + profile, responsive
- `portfolio-cms-worker/wrangler.toml` — CORS prod origin; Cloudflare Pages env `VITE_API_BASE_URL`
