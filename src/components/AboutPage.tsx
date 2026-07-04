import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PortfolioData, AboutProfile, SiteSettings } from "../models/portfolio.model";
import { Wrench } from "lucide-react";
import { getAboutProfile, getSiteSettings } from "../services/api";
import { LoadingScreen } from "./LoadingScreen";
import { SectionError } from "./SectionState";

type Perspective = "architect" | "lead" | "developer";

interface PerspectiveContent {
  heroRole: string;
  badge: string;
  headline: string;
  tagline: string;
  philosophyTitle: string;
  philosophyText: string;
  focusTitle: string;
  focusText: string;
}

const PERSPECTIVES: Record<Perspective, PerspectiveContent> = {
  architect: {
    heroRole: "System Architect & .NET Engineer",
    badge: "THE ARCHITECT",
    headline: "Building scalable digital ecosystems with precision and purpose.",
    tagline: "Building robust enterprise systems that scale from database to UI — designed for resilience, modularity, and long-term maintainability.",
    philosophyTitle: "Architectural Focus",
    philosophyText: "Strict adherence to clean code, modular design, layered architecture, repository patterns, and granular access controls (RBAC) to support software health.",
    focusTitle: "Systems & Optimization",
    focusText: "Optimizing relational databases (Index tuning, Query plan analysis), microservice API contracts, and Azure cloud integration.",
  },
  lead: {
    heroRole: "Team Lead & Senior .NET Developer",
    badge: "THE TEAM LEAD",
    headline: "Translating complex business requirements into high-impact delivery.",
    tagline: "Led delivery of key Enterprise SaaS modules (HCM, HRMS) directing 5-developer agile teams and delivering zero-collision scheduling models.",
    philosophyTitle: "Agile Leadership",
    philosophyText: "Empowering developers through constructive code reviews, structured task allocation, and active collaboration to meet tight timelines.",
    focusTitle: "Business Integration",
    focusText: "Full-lifecycle ownership, workflow automation (including automated onboarding pipeline validation), and streamlined executive stakeholder reporting.",
  },
  developer: {
    heroRole: "Full-Stack .NET & Angular Developer",
    badge: "THE FULL STACK DEVELOPER",
    headline: "Writing robust, high-performance production code from backend to frontend.",
    tagline: "Focused on shipping fast C# backend microservices, optimized SQL Server queries, and clean Angular user interfaces.",
    philosophyTitle: "Development Standard",
    philosophyText: "Pragmatic, dry, and highly performant code designed for immediate productivity. Resolves business issues without added visual or technical noise.",
    focusTitle: "Technology Focus",
    focusText: "Deep expertise in C#, ASP.NET Core, SQL Server (Stored Procedures), Web APIs, responsive web interfaces, and Firebase notifications.",
  },
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

  const [perspective, setPerspective] = React.useState<Perspective>("architect");
  const activeContent = PERSPECTIVES[perspective];

  if (error) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="100vh" />;
  }

  if (loading || !profile || !settings) {
    return <LoadingScreen />;
  }

  const displayName = settings.name || master.candidate.name;
  const nameParts = displayName.split(" ");
  const yearsExperience = settings.yearsExperience || master.stats.years;

  // Admin-managed media (R2 URLs). Mobile falls back to desktop; empty = keep the default look.
  const heroDesktop = settings.heroBackground?.desktop || "";
  const heroMobile = settings.heroBackground?.mobile || heroDesktop;
  const hasHero = !!heroDesktop;
  const profileDesktop = settings.profileImage?.desktop || "";
  const profileMobile = settings.profileImage?.mobile || profileDesktop;
  const hasProfile = !!profileDesktop;


  return (
    <>
      {/* Hero Section */}
      <header className="min-h-[78vh] lg:min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden bg-background animate-fadeIn">
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
              key={perspective + "-hero-role"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs lg:text-sm font-bold text-accent uppercase tracking-[0.3em] lg:tracking-[0.6em] text-center"
            >
              {activeContent.heroRole}
            </motion.span>

            {/* Perspective switching lives in the About section below, next to the
                content it changes — kept out of the hero to keep the entry clean. */}
            <div className="w-px h-10 lg:h-16 bg-gradient-to-b from-accent to-transparent mt-4" />
          </div>
        </motion.div>
        
        {/* Background Initials */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[40vw] font-luxury font-black text-text-secondary/15 select-none animate-pulse">MF</span>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-36 px-5 md:px-8 lg:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
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
            <div className="absolute -bottom-4 lg:right-6 bg-background p-6 rounded-2xl shadow-xl shadow-text-secondary/10 border border-border select-none">
              <p className="text-3xl font-luxury font-bold text-text-primary mb-1">{yearsExperience}</p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Years Experience</p>
            </div>
          </div>
          <div className="lg:w-2/3 w-full">
            {/* Perspective Sub-Header Selector */}
            <div className="mb-10 p-1 bg-surface border border-border rounded-xl inline-flex flex-wrap gap-1 text-xs font-semibold backdrop-blur-xs select-none">
              {(["architect", "lead", "developer"] as const).map((p) => (
                <button
                  key={p + "-about-btn"}
                  onClick={() => setPerspective(p)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 uppercase tracking-widest text-[9px] font-bold cursor-pointer ${
                    perspective === p 
                      ? "bg-text-primary text-background shadow-md" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  }`}
                >
                  {p === "architect" && "📐 The Architect"}
                  {p === "lead" && "👥 The Tech Lead"}
                  {p === "developer" && "💻 The Developer"}
                </button>
              ))}
            </div>

            <motion.div
              key={perspective}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block min-h-[1.5rem]">
                {activeContent.badge}
              </span>
              <h2 className="text-4xl lg:text-5xl font-luxury font-medium leading-tight text-text-primary">
                {activeContent.headline}
              </h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-2xl">
                {activeContent.tagline} {profile.tagline}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">
                    {activeContent.philosophyTitle}
                  </h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    {activeContent.philosophyText}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest border-b border-border pb-2">
                    {activeContent.focusTitle}
                  </h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    {activeContent.focusText}
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills & Experience Summary */}
      <section className="py-24 lg:py-36 px-5 md:px-8 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-12 block">SKILLS</span>
            <div className="space-y-12">
              {profile.skills && profile.skills.map((skill: any) => (
                <div key={skill.category} className="flex gap-12">
                  <h4 className="w-1/3 text-xs font-bold text-accent italic uppercase tracking-widest">{skill.category}</h4>
                  <div className="w-2/3 flex flex-wrap gap-x-6 gap-y-2">
                    {skill.items && skill.items.map((item: string) => (
                      <span key={item} className="text-sm font-medium text-text-secondary">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-12 block">EXPERIENCE</span>
            <div className="space-y-12">
              {profile.experienceTimeline && profile.experienceTimeline.map((exp: any, index: number) => (
                <div key={index} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 border-b border-border pb-8">
                    <div>
                      <h4 className="text-xl font-luxury font-bold text-text-primary mb-1">{exp.company}</h4>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{exp.role}</p>
                    </div>
                    <p className="text-xs font-bold text-accent uppercase tracking-widest shrink-0">{exp.period.toUpperCase()}</p>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">Recognition</h4>
                    <p className="text-sm text-text-secondary font-medium italic leading-relaxed">
                      "{exp.description}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shipped Work Teaser Banner */}
      <section className="py-24 px-5 md:px-8 lg:px-24 bg-surface flex flex-col items-center text-center border-t border-border">
        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4 block">SHIPPED BLUEPRINTS</span>
        <h3 className="text-3xl lg:text-5xl font-luxury font-medium mb-6 text-text-primary">Case Studies & Architectures</h3>
        <p className="text-base text-text-secondary font-medium max-w-xl mb-10 leading-relaxed">
          Explore in-depth technical breakdowns of Healthcare ERP systems, candidate onboarding engines, and live vehicle marketplace networks built under enterprise repository patterns.
        </p>
        <button 
          onClick={() => handleNavClick("work")}
          className="px-8 py-4 bg-text-primary hover:bg-accent hover:text-accent-foreground text-background text-xs font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer shadow-lg"
        >
          Go to Dedicated Work Tab
        </button>
      </section>
    </>
  );
};
