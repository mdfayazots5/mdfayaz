import type { CredibilityNote } from "../models/portfolio.model";

/**
 * Defaults for the CMS-editable home page copy (`SiteSettings.hiringStrengths` /
 * `SiteSettings.credibilityNotes`). Used when the R2 settings object has no value yet,
 * and to prefill the admin Settings editor so what the admin sees matches the live site.
 */
export const DEFAULT_HIRING_STRENGTHS: string[] = [
  "{years} years of production .NET delivery",
  "EF Core, SQL Server tuning & clean, layered architecture",
  "Team-lead experience with code reviews and delivery ownership",
];

export const DEFAULT_CREDIBILITY_NOTES: CredibilityNote[] = [
  {
    title: "Architecture-first delivery",
    desc: "I architect layered .NET systems around clean APIs, stable data models, and maintainable module boundaries.",
  },
  {
    title: "Testing and review discipline",
    desc: "I use code reviews, testable service design, and unit-test-friendly patterns to keep production changes controlled.",
  },
  {
    title: "Technical writing",
    desc: "I document implementation decisions and share notes on full-stack engineering, tools, and delivery practices.",
  },
];

/** "3.3" / "3+" → "3+"; empty or invalid → "3+". */
export const formatYears = (yearsExperience?: string): string => {
  const years = Math.floor(parseFloat(yearsExperience || ""));
  return Number.isFinite(years) && years > 0 ? `${years}+` : "3+";
};

/** Replaces the `{years}` token so strengths stay in sync with the years stat. */
export const fillYears = (text: string, yearsExperience?: string): string =>
  text.replace(/\{years\}/g, formatYears(yearsExperience));
