import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PortfolioData, AboutProfile, SiteSettings } from "../models/portfolio.model";
import { Briefcase, Package, Wrench } from "lucide-react";
import { getAboutProfile, getSiteSettings } from "../services/api";
import { LoadingScreen } from "./LoadingScreen";
import { SectionError } from "./SectionState";

// One clear, recruiter-first identity — no persona switching. Grounded in the real
// track record: 3+ years, ASP.NET Core + SQL Server, and end-to-end team-led delivery.
const IDENTITY = {
  badge: "WHO I AM",
  headline: "Building enterprise systems that scale from database to UI.",
  philosophyTitle: "How I Work",
  philosophyText: "Clean, modular, layered architecture with a focus on long-term maintainability — from SQL Server schema design and stored-procedure optimization to secure JWT-protected APIs and responsive front-ends.",
  focusTitle: "What I Bring",
  focusText: "3+ years shipping production healthcare (HMS) and HR (HRMS) platforms with ASP.NET Core, C#, and SQL Server — including leading a 4-member team through full end-to-end delivery.",
};

interface AboutPageProps {
  master: PortfolioData["master"];
  handleNavClick: (tab: any, targetId?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ master, handleNavClick }) => {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    Promise.all([getAboutProfile(), getSiteSettings()])
      .then(([profileData, settingsData]) => {
        if (isMounted) {
          setProfile(profileData);
          setSettings(settingsData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  if (error) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="100vh" />;
  }

  if (loading || !profile || !settings) {
    return <LoadingScreen />;
  }

  const displayName = settings.name || master.candidate.name;
  const nameParts = displayName.split(" ");
  const yearsExperience = settings.yearsExperience || master.stats.years;
  // Show a clean "3+" instead of a precise "3.3" — reads better as a hiring signal.
  const yearsDisplay = (() => {
    const n = parseFloat(yearsExperience);
    return Number.isFinite(n) ? `${Math.floor(n)}+` : yearsExperience;
  })();

  // Admin-managed media (R2 URLs). Mobile falls back to desktop; empty = keep the default look.
  const heroDesktop = settings.heroBackground?.desktop || "";
  const heroMobile = settings.heroBackground?.mobile || heroDesktop;
  const hasHero = !!heroDesktop;
  const profileDesktop = settings.profileImage?.desktop || "";
  const profileMobile = settings.profileImage?.mobile || profileDesktop;
  const hasProfile = !!profileDesktop;
  const workActions = [
    {
      label: "Experience",
      description: "Company work, delivery ownership, timelines, and impact.",
      icon: Briefcase,
      tab: "company",
    },
    {
      label: "Projects",
      description: "Personal products, side builds, links, and technology choices.",
      icon: Package,
      tab: "products",
    },
  ];


  return (
    <>
      {/* Hero Section */}
      <header className="min-h-[58vh] lg:min-h-screen flex flex-col items-center justify-center px-6 py-12 lg:py-16 relative overflow-hidden bg-background animate-fadeIn">
        {/* Admin-managed hero background (responsive: mobile variant under md, desktop at md+). A
            theme-aware scrim keeps the name/subtitle legible over any photo in light & dark. */}
        {hasHero && (
          <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
            <picture>
              {heroMobile && <source media="(max-width: 767px)" srcSet={heroMobile} />}
              <img
                src={heroDesktop}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover max-w-full"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background/90" />
          </div>
        )}
        <motion.div
          style={{ opacity, scale }}
          className="text-center z-10 flex flex-col items-center"
        >
          <h1 className="text-[14vw] lg:text-[11vw] font-luxury font-light tracking-tighter leading-[0.85] mb-8 select-none text-text-primary">
            {nameParts[0]}<br />
            {nameParts.slice(1).join(" ")}
          </h1>
          <div className="flex flex-col items-center gap-6">
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs lg:text-sm font-bold text-accent uppercase tracking-[0.3em] lg:tracking-[0.6em] text-center"
            >
              {settings.role || master.candidate.role}
            </motion.span>

            <div className="w-px h-10 lg:h-16 bg-gradient-to-b from-accent to-transparent mt-4" />
          </div>
        </motion.div>
      </header>

      {/* About Section */}
      <section id="about" className="py-14 lg:py-28 px-5 md:px-8 lg:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-14 lg:gap-24 items-center">
          <div className="lg:w-1/3 w-full relative flex justify-center">
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-border flex items-center justify-center relative bg-background/50 backdrop-blur-sm overflow-hidden">
              {hasProfile ? (
                <picture>
                  {profileMobile && <source media="(max-width: 767px)" srcSet={profileMobile} />}
                  <img
                    src={profileDesktop}
                    alt={displayName}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover max-w-full rounded-full"
                  />
                </picture>
              ) : (
                <>
                  <div className="absolute inset-4 rounded-full border border-accent/25" />
                  <span className="text-7xl lg:text-9xl font-luxury font-light text-accent select-none">MF</span>
                </>
              )}
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-right-3 flex items-center gap-3 bg-background pl-4 pr-5 py-3 rounded-2xl shadow-xl shadow-text-secondary/10 border border-border select-none">
              <span className="text-4xl font-luxury font-bold text-accent leading-none">{yearsDisplay}</span>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-tight max-w-[4.5rem]">
                Years Experience
              </span>
            </div>
          </div>
          <div className="lg:w-2/3 w-full">
            <div className="space-y-8">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block">
                {IDENTITY.badge}
              </span>
              <h2 className="text-4xl lg:text-5xl font-luxury font-medium leading-tight text-text-primary">
                {IDENTITY.headline}
              </h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-2xl">
                {profile.tagline}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">
                    {IDENTITY.philosophyTitle}
                  </h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    {IDENTITY.philosophyText}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">
                    {IDENTITY.focusTitle}
                  </h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    {IDENTITY.focusText}
                  </p>
                </div>
              </div>

              {/* Inline Setup / Uses CTA Block */}
              <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" id="about-uses-cta">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-accent uppercase tracking-[0.3em] block">WORKSTATION & TOOLS</span>
                  <h5 className="text-base font-luxury font-bold text-text-primary">Want to inspect my enterprise setup & workstation?</h5>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-lg">
                    The languages, editor, gear, and OS I ship with every day.
                  </p>
                </div>
                <button
                  onClick={() => handleNavClick("uses")}
                  className="group flex items-center gap-1.5 px-4 py-2.5 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer shrink-0"
                >
                  <span>View Uses Setup</span>
                  <Wrench size={10} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Preview */}
      <section className="py-14 lg:py-28 px-5 md:px-8 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block">WORK OVERVIEW</span>
              <h3 className="text-3xl lg:text-5xl font-luxury font-medium text-text-primary leading-tight">
                Start with the right section.
              </h3>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                The home page keeps the story short. Full experience and project details each have a dedicated page for deeper review.
              </p>
            </div>
            <button
              onClick={() => handleNavClick("company")}
              className="px-5 py-3 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer shrink-0"
            >
              View Full Experience
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleNavClick(action.tab)}
                  className="p-5 bg-surface border border-border hover:border-accent/50 rounded-2xl text-left transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-5">
                    <Icon size={17} />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider group-hover:text-accent transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed mt-2">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
