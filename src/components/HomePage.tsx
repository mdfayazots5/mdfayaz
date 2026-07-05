import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { PortfolioData, AboutProfile, SiteSettings, Service } from "../models/portfolio.model";
import { getAboutProfile, getSiteSettings, getServices } from "../services/api";
import { LoadingScreen } from "./LoadingScreen";
import { SectionError } from "./SectionState";

interface HomePageProps {
  master: PortfolioData["master"];
  handleNavClick: (tab: any, targetId?: string) => void;
}

const resolveIcon = (name?: string) => {
  const Cmp = name ? (Icons as any)[name] : null;
  return Cmp || Icons.Layers;
};

export const HomePage: React.FC<HomePageProps> = ({ master, handleNavClick }) => {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    Promise.all([getSiteSettings(), getAboutProfile(), getServices()])
      .then(([s, p, sv]) => {
        if (isMounted) {
          setSettings(s);
          setProfile(p);
          setServices(sv || []);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  if (loading) return <LoadingScreen />;
  if (error || !settings) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="100vh" />;
  }

  const name = settings.name || master.candidate.name;
  const role = settings.role || master.candidate.role;
  const tagline = settings.tagline || profile?.tagline || master.candidate.tagline || "";
  const resumeUrl = settings.resumeUrl && settings.resumeUrl !== "#" ? settings.resumeUrl : "";
  const github = settings.socialLinks?.github || master.candidate.github || "";
  const linkedin = settings.socialLinks?.linkedin || master.candidate.linkedin || "";
  // Admin-managed hero background + profile photo (responsive; mobile falls back to desktop).
  const heroDesktop = settings.heroBackground?.desktop || "";
  const heroMobile = settings.heroBackground?.mobile || heroDesktop;
  const hasHero = !!heroDesktop;
  const profileDesktop = settings.profileImage?.desktop || "";
  const profileMobile = settings.profileImage?.mobile || profileDesktop;
  const hasProfile = !!profileDesktop;

  const projects = (master.projects || []) as any[];
  const companyProjects = projects.filter((p) => p.type === "company");
  const personalProjects = projects.filter((p) => p.type === "personal");
  // Home leads with enterprise experience: company work first (any admin-featured company
  // items float to the top), falling back to personal projects only if there's no company work.
  const showcasePool = companyProjects.length ? companyProjects : personalProjects;
  const featuredProjects = [...showcasePool]
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 3);
  const leadsWithCompany = companyProjects.length > 0;
  const viewAllTab = leadsWithCompany ? "company" : "products";
  const viewAllLabel = leadsWithCompany ? "View all experience" : "View all projects";
  const featuredHeading = leadsWithCompany ? "Enterprise work & experience." : "Projects with real impact.";

  const activeServices = services.filter((s) => s.status === "Active");
  const capabilities = activeServices.length
    ? activeServices.slice(0, 3).map((s) => ({ icon: resolveIcon(s.icon), title: s.name, desc: s.tagline }))
    : (profile?.skills ?? []).slice(0, 3).map((g) => ({
        icon: Icons.Layers,
        title: g.category,
        desc: g.items.join(" · "),
      }));

  const strengths = [
    "3+ years of production .NET delivery",
    "EF Core, SQL Server tuning & clean, layered architecture",
    "Team-lead experience with code reviews and delivery ownership",
  ];

  const credibilityNotes = [
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

  const openProject = (p: any) => {
    window.location.hash = `#project/${p.id}`;
  };

  const techPill = (t: string) => (
    <span
      key={t}
      className="px-2 py-0.5 rounded-md border border-border bg-background text-[9px] font-mono font-bold uppercase tracking-wider text-text-secondary"
    >
      {t}
    </span>
  );

  return (
    <div className="bg-background text-text-primary">
      {/* ===== HERO — background · profile · name · role ===== */}
      <header className="relative min-h-[80vh] lg:min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* Background */}
        {hasHero ? (
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <picture>
              {heroMobile && <source media="(max-width: 767px)" srcSet={heroMobile} />}
              <img src={heroDesktop} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </picture>
            {/* Theme-aware scrim keeps name/role legible over any photo, light or dark. */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-surface via-background to-background" aria-hidden="true" />
        )}

        {/* Foreground: profile → name → role */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Profile photo on the background */}
          <div className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border border-border bg-surface shadow-2xl ring-4 ring-background/70">
            {hasProfile ? (
              <picture>
                {profileMobile && <source media="(max-width: 767px)" srcSet={profileMobile} />}
                <img src={profileDesktop} alt={name} className="w-full h-full object-cover" />
              </picture>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/15 to-surface">
                <span className="text-5xl lg:text-6xl font-luxury font-light text-accent">
                  {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-luxury font-bold tracking-tight text-text-primary leading-none">
            {name}
          </h1>

          {/* Role */}
          <span className="mt-4 text-xs lg:text-sm font-bold text-accent uppercase tracking-[0.35em]">
            {role}
          </span>

          {tagline && (
            <p className="mt-5 max-w-xl text-sm md:text-base text-text-secondary font-medium leading-relaxed">
              {tagline}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleNavClick("company")}
              className="group inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              <span>Explore enterprise work</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-surface border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              Get in touch
            </button>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-surface border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                <span>Download resume</span>
                <Download size={13} />
              </a>
            )}
          </div>

          {(github || linkedin) && (
            <div className="mt-6 flex items-center gap-2">
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-11 h-11 rounded-lg border border-border bg-surface/60 text-text-secondary hover:text-accent hover:border-accent/50 transition-colors inline-flex items-center justify-center"
                >
                  <Linkedin size={15} />
                </a>
              )}
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="w-11 h-11 rounded-lg border border-border bg-surface/60 text-text-secondary hover:text-accent hover:border-accent/50 transition-colors inline-flex items-center justify-center"
                >
                  <Github size={15} />
                </a>
              )}
            </div>
          )}
        </motion.div>
      </header>

      {/* ===== FEATURED WORK ===== */}
      {featuredProjects.length > 0 && (
        <section id="featured-work" className="px-5 md:px-8 lg:px-16 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.35em] block">Featured Work</span>
                <h2 className="text-2xl md:text-4xl font-luxury font-bold text-text-primary leading-tight">
                  {featuredHeading}
                </h2>
              </div>
              <button
                onClick={() => handleNavClick(viewAllTab)}
                className="group inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface border border-border hover:border-accent text-text-primary hover:text-accent text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <span>{viewAllLabel}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProject(p)}
                  className="group text-left bg-surface border border-border rounded-2xl p-6 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-secondary bg-background border border-border px-2 py-0.5 rounded-md">
                      {p.categoryTag || p.type}
                    </span>
                    <ArrowUpRight size={15} className="text-text-secondary group-hover:text-accent transition-colors shrink-0" />
                  </div>
                  <h3 className="mt-4 text-lg font-luxury font-bold text-text-primary leading-snug group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  {(p.tagline || p.description) && (
                    <p className="mt-2 text-sm text-text-secondary font-medium leading-relaxed">
                      {p.tagline || p.description}
                    </p>
                  )}
                  {Array.isArray(p.tech) && p.tech.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.slice(0, 3).map(techPill)}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== WHAT I DO ===== */}
      {capabilities.length > 0 && (
        <section className="px-5 md:px-8 lg:px-16 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-2 mb-8 max-w-xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.35em] block">What I do</span>
              <h2 className="text-2xl md:text-4xl font-luxury font-bold text-text-primary leading-tight">
                Product-minded engineering.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {capabilities.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <div key={idx} className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-5">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{c.title}</h3>
                    {c.desc && <p className="mt-2 text-sm text-text-secondary font-medium leading-relaxed">{c.desc}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== TECHNICAL CREDIBILITY ===== */}
      <section className="px-5 md:px-8 lg:px-16 pb-16">
        <div className="max-w-6xl mx-auto bg-surface border border-border rounded-3xl p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.35em] block">
                Technical proof
              </span>
              <h2 className="text-2xl md:text-4xl font-luxury font-bold text-text-primary leading-tight">
                Built for systems that need to survive real users.
              </h2>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                The focus is not only UI output. It is reliable APIs, clear database decisions, reviewable code, and measurable delivery.
              </p>
            </div>
            {(settings.blog || master.candidate.blog) && (
              <a
                href={settings.blog || master.candidate.blog}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-background border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <BookOpen size={14} />
                <span>Read technical notes</span>
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {credibilityNotes.map((note) => (
              <div key={note.title} className="bg-background border border-border rounded-2xl p-5">
                <CheckCircle2 size={16} className="text-accent mb-4" />
                <h3 className="text-sm font-bold text-text-primary">{note.title}</h3>
                <p className="mt-2 text-sm text-text-secondary font-medium leading-relaxed">{note.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIRING CTA ===== */}
      <section className="px-5 md:px-8 lg:px-16 pb-8">
        <div className="max-w-6xl mx-auto bg-surface border border-border rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.35em] block">Open to roles</span>
            <h2 className="text-2xl md:text-4xl font-luxury font-bold text-text-primary leading-tight">
              Looking for a .NET developer?
            </h2>
            <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-md">
              {settings.availability
                ? `Availability: ${settings.availability}. `
                : ""}
              Let's talk about how I can contribute to your team and your systems.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => handleNavClick("contact")}
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Get in touch
              </button>
              <button
                onClick={() => handleNavClick("company")}
                className="inline-flex items-center gap-2 px-5 py-3 bg-background border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                View experience
              </button>
            </div>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6 md:p-7">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
              What I bring
            </span>
            <ul className="mt-4 space-y-3">
              {strengths.map((e) => (
                <li key={e} className="flex items-center gap-3 text-sm font-medium text-text-primary">
                  <CheckCircle2 size={16} className="text-accent shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
