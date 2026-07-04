# Task: Theme Set Visual Variants

**For:** Review first, then phased implementation after approval. Follow `CLAUDE.md`
(role governance, separation of concerns, Tailwind token usage, hash-router/admin idioms, QA gate).

Goal: add a **Theme Set** picker like the reference screenshot so the site can switch between curated
visual variants such as **Slate Classic**, **Ivory Teal**, **Copper Soft Paper**, **Dusty Lilac Receipt**,
and **Soft Sage Receipt**. The picker should feel native to the portfolio, work with the existing
Light/Dark mode control, and persist safely.

---

## Selected Roles From `CLAUDE.md`

- **Super Senior Web Designer & Architect** - owns the visual system, theme palettes, swatches,
  selected/hover states, borders, type contrast, and recruiter-first scannability.
- **Senior Frontend Engineer** - owns theme state, TypeScript models, persistence, component structure,
  and integration with the existing `ThemeProvider`.
- **Release Engineer** - owns build health, Playwright visual checks, responsive QA, and final validation.

---

## Current State

- `src/components/ThemeProvider.tsx` currently supports only `light | dark`.
- `src/index.css` defines root and `.dark` CSS variables for the active color system.
- `SiteSettings` already stores site-wide identity/media settings, but not a selected theme variant.
- The admin layout already includes a theme mode toggle, but no Theme Set selector.
- Public pages consume Tailwind token colors such as `bg-background`, `bg-surface`, `text-text-primary`,
  `text-text-secondary`, `border-border`, and `text-accent`; that makes token-based theme variants feasible.

---

## Desired UX

Add a **Theme Set** panel similar to the reference:

- Header: `Theme Set`
- Helper text: `Pick a visual theme variant`
- A vertical list of selectable theme cards.
- Each option includes:
  - compact color swatch
  - theme name
  - short description
  - visible selected state
- Selecting a theme updates the whole app immediately.
- Light/Dark mode remains separate:
  - Mode controls brightness.
  - Theme Set controls palette personality.
- Theme choice persists across reloads.
- If backend persistence is approved, admin-selected defaults should also save to R2 settings.

Initial variants:

| Theme Set | Intent |
| --- | --- |
| **Slate Classic** | Current calm slate/sky baseline with strong contrast. |
| **Ivory Teal** | Warm ivory surfaces with deep teal accents inspired by the screenshot. |
| **Copper Soft Paper** | Neutral paper background, muted copper accents, subtle borders. |
| **Dusty Lilac Receipt** | Warm paper-like lilac theme, soft lavender panels, deep plum text. |
| **Soft Sage Receipt** | Soft warm paper background, muted sage accents, dark olive text. |

---

## Implementation Direction

Use CSS variables as the single rendering mechanism. Avoid hard-coded palette classes in components.

Recommended structure:

- Add a `ThemeSet` union type, for example:
  - `slate-classic`
  - `ivory-teal`
  - `copper-soft-paper`
  - `dusty-lilac-receipt`
  - `soft-sage-receipt`
- Extend `ThemeProvider` to manage:
  - `mode: "light" | "dark"`
  - `themeSet: ThemeSet`
  - `setThemeSet(themeSet)`
  - existing `toggleTheme()` compatibility if useful.
- Apply theme state on `<html>`:
  - existing `.dark` class for mode
  - new `data-theme-set="ivory-teal"` attribute for palette
- Define all palette variables in `src/index.css` using:
  - `:root[data-theme-set="..."]`
  - `.dark[data-theme-set="..."]`
- Keep components using existing token names:
  - `--color-bg`
  - `--color-surface`
  - `--color-border`
  - `--color-text-primary`
  - `--color-text-secondary`
  - `--color-accent`
  - `--color-accent-hover`
  - `--color-accent-foreground`

---

## Phase Plan

### Phase 1 - Theme Model + Token Plan

**Primary roles:** Super Senior Web Designer & Architect, Senior Frontend Engineer

- Define the exact `ThemeSet` names, labels, descriptions, and swatch colors.
- Add a shared theme-set config module so UI and provider use the same source of truth.
- Decide persistence scope:
  - local preference only, or
  - local preference plus admin-managed default in `SiteSettings`.
- Confirm how mode and theme set interact.

**Acceptance:**

- Theme variants have stable IDs and copy.
- Token mappings are documented before UI implementation.
- No component-level hard-coded palette logic is required.

---

### Phase 2 - ThemeProvider State + CSS Variables

**Primary role:** Senior Frontend Engineer

- Update `ThemeProvider` from mode-only to mode + theme set.
- Preserve backward compatibility with the existing `portfolio-theme` localStorage value.
- Add a new localStorage key such as `portfolio-theme-set`.
- Apply `data-theme-set` to the document root.
- Add CSS variable blocks for all approved theme sets in light and dark mode.
- Keep transitions subtle and avoid layout shift.

**Acceptance:**

- Theme Set changes update the whole app immediately.
- Light/Dark mode still works.
- Reload preserves both selected mode and selected theme set.
- Existing public/admin components continue to consume Tailwind tokens.

---

### Phase 3 - Theme Set Picker UI

**Primary roles:** Super Senior Web Designer & Architect, Senior Frontend Engineer

- Build a reusable `ThemeSetPicker` component.
- Use compact option rows/cards like the reference screenshot.
- Include swatch, name, description, selected state, keyboard focus, and accessible labels.
- Place the picker where it belongs:
  - public settings/quick panel if the app has one, and/or
  - admin settings panel for owner-controlled defaults.
- Use lucide icons only where they clarify interaction.

**Acceptance:**

- The picker looks polished on desktop and mobile.
- Text never overflows inside option cards.
- Selected, hover, focus, and disabled/loading states are clear.
- No nested card-heavy layout; keep it consistent with the existing minimal-grid aesthetic.

---

### Phase 4 - Optional Admin + R2 Persistence

**Primary roles:** Senior Frontend Engineer, Release Engineer

Only implement this phase if review approves backend persistence.

- Extend `SiteSettings` in:
  - `src/models/portfolio.model.ts`
  - `portfolio-cms-worker/src/types.ts`
- Add optional `themeSet?: ThemeSet` or equivalent string field.
- Update fallback settings and Worker default settings.
- Ensure `PUT /settings` preserves the selected default theme set.
- Admin-selected theme set becomes the default for first-time visitors.
- Visitor local preference may still override the admin default locally.

**Acceptance:**

- Settings saves do not wipe existing media fields.
- Old settings without `themeSet` still load.
- First-time visitors receive the admin default.
- Returning visitors keep their local preference.

---

### Phase 5 - Responsive + Visual QA

**Primary role:** Release Engineer

- Run `npm run lint`.
- Run `npm run build`.
- Run Playwright checks for:
  - desktop public homepage
  - mobile public homepage
  - admin settings/theme panel
  - light and dark mode
  - at least two theme-set variants
- Confirm no horizontal scroll, broken contrast, or overlapping text.
- Confirm theme persistence after reload.

**Acceptance:**

- Type-check and build pass.
- Theme picker is usable by keyboard and pointer.
- Palettes remain readable in light and dark mode.
- The current brand identity remains recognizable.

---

## Suggested File Touch List

- `src/components/ThemeProvider.tsx`
- `src/components/ThemeToggle.tsx`
- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/AdminSettingsPage.tsx`
- `src/index.css`
- `src/models/portfolio.model.ts` if admin/R2 persistence is approved
- `src/data/fallback/settings.fallback.ts` if admin/R2 persistence is approved
- `portfolio-cms-worker/src/types.ts` if admin/R2 persistence is approved
- `portfolio-cms-worker/src/handlers/settings.handler.ts` if admin/R2 persistence is approved
- Playwright tests under `tests/` if coverage needs to be expanded

---

## Open Review Questions

1. Should Theme Set be a visitor-only preference, or should admin choose the site-wide default?
2. Should all five variants ship in the first implementation, or should Phase 1 start with only
   Slate Classic + Ivory Teal?
3. Should the picker appear publicly, in admin only, or in both places?
4. Should existing users with `portfolio-theme = "light" | "dark"` automatically keep their mode
   while defaulting to `slate-classic`?

---

## Do Not Start Until Approved

This file is the planning artifact for review. Implementation should begin only after the phase plan,
variant list, and persistence decision are approved.
