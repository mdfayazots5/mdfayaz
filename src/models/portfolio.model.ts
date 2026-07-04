export interface Candidate {
  name: string;
  role: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  locationShort: string;
  notice: string;
  openToRelocation: boolean;
  github: string;
  linkedin: string;
  portfolio: string;
  dob: string;
  blog?: string;
}

export interface Stats {
  years: string;
  modules: string;
  domains: number;
  users: string;
  perfImprovement: string;
  teamLed: number;
}

export interface Company {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface Skill {
  category: string;
  items: string[];
  level: number;
}

export interface Project {
  id: number;
  name: string;
  shortName: string;
  domain: string;
  role: string;
  roleType: string;
  description: string;
  metrics: Record<string, any>;
  bullets: string[];
  tech: string[];
  color: string;
  icon: string;
  startDate: string;
  endDate: string;
  category?: "company" | "personal";
  companyName?: string;
  timeline?: string;
}

export interface Achievement {
  icon: string;
  title: string;
  org: string;
  description: string;
  metric: string;
}

export interface MasterData {
  candidate: Candidate;
  stats: Stats;
  company: Company;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
}

export interface PortfolioData {
  master: MasterData;
}

export interface AboutProfile {
  tagline: string;
  architectBio: string;
  leadBio: string;
  developerBio: string;
  skills: { category: string; items: string[] }[];
  experienceTimeline: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface UsesItem {
  id: string;
  name: string;
  description: string;
  tag?: string;
}

export interface UsesCategory {
  id: string;
  name: string;
  subtitle?: string;
  items: UsesItem[];
}

export interface PrivacySection {
  id: string;
  title: string;
  body: string;
}

export interface SiteSettings {
  name: string;              // full display name, e.g. "Mohammed Fayaz"
  role: string;              // headline role, e.g. ".NET Full Stack Developer"
  location: string;          // e.g. "Hyderabad, Telangana, India"
  availability: string;      // notice period / availability, e.g. "Immediate"
  openToRelocation: boolean;
  yearsExperience: string;   // headline stat, e.g. "3.3"
  blog: string;              // optional blog URL ("" if none)
  contactEmail: string;
  socialLinks: {
    github: string;
    linkedin: string;
    dob: string;
    mobile: string;
  };
  resumeUrl: string;
  tagline: string;

  // Admin-managed media (R2 public URLs). Optional — absence means "no image / default look".
  // If `mobile` is absent, the UI falls back to `desktop`.
  profileImage?: { desktop?: string; mobile?: string };
  heroBackground?: { desktop?: string; mobile?: string };

  // Admin-selected default palette for first-time visitors. Optional — absence means
  // "slate-classic". A returning visitor's local preference (localStorage) overrides this.
  themeSet?: ThemeSet;
}

/**
 * Curated visual palette variants. `mode` (light/dark) controls brightness;
 * `ThemeSet` controls palette personality. Rendered purely via CSS variables —
 * see `data-theme-set` in `ThemeProvider` and the palette blocks in `src/index.css`.
 * Metadata (labels, descriptions, swatches) lives in `src/config/theme-sets.ts`.
 */
export type ThemeSet =
  | "slate-classic"
  | "ivory-teal"
  | "copper-soft-paper"
  | "dusty-lilac-receipt"
  | "soft-sage-receipt";

export interface Product {
  id: number;
  name: string;
  tagline: string;
  description: string;
  status: string;        // "Live" | "In Development" | "Private Beta" | "Completed"
  categoryTag: string;    // e.g. "Monitoring Tool", "Web App"
  tech: string[];
  features: string[];     // exactly 3 short bullet points
  audience: string;
  icon: string;           // lucide-react icon name for the preview placeholder
  previewImage?: string;  // optional image URL — if absent, use icon placeholder
  link?: string;           // optional external URL for "Details"
  displayOrder: number;
}

export interface Entry {
  id: number;
  type: 'company' | 'personal';
  title: string;
  tagline: string;
  categoryTag: string;
  description: string;
  features: string[];        // responsibilities (company) or features (personal)
  tech: string[];
  achievements: string[];    // quantified impact, e.g. "Led a team of 5"

  // company-specific (present when type === 'company')
  companyName?: string;
  role?: string;
  teamSize?: number;
  startDate?: string;
  endDate?: string;          // or "Present"

  // personal-specific (present when type === 'personal')
  status?: 'Live' | 'In Development' | 'Private Beta' | 'Completed';
  audience?: string;

  // proof links (optional, both types)
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  videoUrl?: string;

  // media
  coverImage?: string;       // falls back to icon placeholder if absent
  icon: string;
  color: string;

  featured: boolean;
  displayOrder: number;
}

export interface Service {
  id: number;
  name: string;
  tagline: string;        // short card description
  description: string;    // longer text for the detail modal
  highlights: string[];   // 2-4 bullet points for the detail modal
  icon: string;           // lucide-react icon name
  status: 'Active' | 'Inactive';
  displayOrder: number;
}


