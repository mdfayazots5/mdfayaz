import type { ThemeSet } from "../models/portfolio.model";

/**
 * Single source of truth for Theme Set metadata used by the picker UI and the
 * ThemeProvider. The actual palette token values live in `src/index.css`
 * (`:root[data-theme-set]` / `.dark[data-theme-set]` blocks); the `swatch` here
 * is a small visual approximation (bg · surface · accent · text) for the picker.
 *
 * Keep IDs stable — they are persisted to localStorage (`portfolio-theme-set`)
 * and, for the admin default, to R2 `SiteSettings.themeSet`.
 */
export interface ThemeSetOption {
  id: ThemeSet;
  label: string;
  description: string;
  /** Preview swatch approximating the LIGHT palette: [bg, surface, accent, text]. */
  swatch: [string, string, string, string];
}

export const DEFAULT_THEME_SET: ThemeSet = "slate-classic";

export const THEME_SETS: readonly ThemeSetOption[] = [
  {
    id: "slate-classic",
    label: "Slate Classic",
    description: "Calm slate & sky baseline with strong contrast.",
    swatch: ["#F0F9FF", "#FFFFFF", "#0EA5E9", "#0F172A"],
  },
  {
    id: "ivory-teal",
    label: "Ivory Teal",
    description: "Warm ivory surfaces with deep teal accents.",
    swatch: ["#F7F4EC", "#FFFDF8", "#0F766E", "#1C2B2A"],
  },
  {
    id: "copper-soft-paper",
    label: "Copper Soft Paper",
    description: "Neutral paper background with muted copper accents.",
    swatch: ["#F5F3EF", "#FFFFFF", "#B4703A", "#262220"],
  },
  {
    id: "dusty-lilac-receipt",
    label: "Dusty Lilac Receipt",
    description: "Soft lavender panels over paper, deep plum text.",
    swatch: ["#F4F0F5", "#FBF8FC", "#7C5A9E", "#2E2233"],
  },
  {
    id: "soft-sage-receipt",
    label: "Soft Sage Receipt",
    description: "Warm paper background with muted sage, dark olive text.",
    swatch: ["#F2F3EC", "#FBFCF6", "#5F7A4E", "#262A1E"],
  },
] as const;

const THEME_SET_IDS = new Set<string>(THEME_SETS.map((t) => t.id));

/** Narrow an arbitrary string (localStorage / API) to a valid ThemeSet, else the default. */
export function normalizeThemeSet(value: string | null | undefined): ThemeSet {
  return value && THEME_SET_IDS.has(value) ? (value as ThemeSet) : DEFAULT_THEME_SET;
}
