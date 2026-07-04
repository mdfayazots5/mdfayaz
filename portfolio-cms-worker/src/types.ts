export interface Env {
  CMS_BUCKET: R2Bucket;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  ALLOWED_ORIGIN_PROD: string;
  ALLOWED_ORIGIN_DEV: string;
  R2_PUBLIC_URL: string;
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
  // Admin-managed media (R2 public URLs). Optional; `mobile` falls back to `desktop`.
  profileImage?: { desktop?: string; mobile?: string };
  heroBackground?: { desktop?: string; mobile?: string };
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
