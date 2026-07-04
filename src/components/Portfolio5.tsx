import React from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { PortfolioData } from "../models/portfolio.model";
import { ProjectCard } from "./ProjectCard";
import { ContactForm } from "./ContactForm";

import { UsesPage } from "./UsesPage";
import { HomePage } from "./HomePage";
import { AboutPage } from "./AboutPage";
import { PrivacyPage } from "./PrivacyPage";
import { FaqPage } from "./FaqPage";
import { ProductsPage } from "./ProductsPage";
import { ServicesPage } from "./ServicesPage";
import { Github, Linkedin, BookOpen, User, Wrench, Shield, HelpCircle, ChevronDown, Sparkles, Lock, Briefcase, Palette, FileText } from "lucide-react";
import { ThemeSidebar } from "./ThemeSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";
import { SiteSettings } from "../models/portfolio.model";
import { getSiteSettings } from "../services/api";

interface Portfolio5Props {
  data: PortfolioData;
}

export const Portfolio5: React.FC<Portfolio5Props> = ({ data }) => {
  const { master } = data;
  const { applyAdminDefault } = useTheme();

  const [activeTab, setActiveTab] = React.useState<"home" | "about" | "work" | "uses" | "privacy" | "faq" | "contact" | "404" | "products" | "services">("home");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = React.useState(false);
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = React.useState(false);
  const [workSubTab, setWorkSubTab] = React.useState<"company" | "personal" | "products" | "services">("personal");
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const hoverTimeout = React.useRef<number | null>(null);
  const lenis = useLenis();

  // Jump to top on tab switches (pushState doesn't fire hashchange, so we do it here).
  const scrollTopInstant = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  // #1 — track scroll so the fixed header can swap from blend-mode transparency to a
  // solid, always-legible blurred bar once the user leaves the very top.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // #4 — pointer-capable desktop devices auto-open the nav menus on hover.
  const canHover = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (min-width: 768px)").matches;

  const openMenuOnHover = (which: "about" | "work") => {
    if (!canHover()) return;
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    setIsDropdownOpen(which === "about");
    setIsWorkDropdownOpen(which === "work");
  };

  const scheduleHoverClose = () => {
    if (!canHover()) return;
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
      setIsWorkDropdownOpen(false);
    }, 180);
  };

  const cancelHoverClose = () => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
  };

  // Dynamic Metadata Sync Helper
  const updatePageMetadata = (tab: string) => {
    let titleSet = "Mohammed Fayaz | .NET Full Stack Developer";
    let descSet = "Mohammed Fayaz — .NET Full Stack Developer with 3+ years building scalable healthcare, HRMS and SaaS applications using ASP.NET Core, Angular and SQL Server.";

    if (tab === "work") {
      titleSet = "Work | Mohammed Fayaz";
      descSet = "Healthcare, HRMS, and marketplace platform projects by Mohammed Fayaz.";
    } else if (tab === "about") {
      titleSet = "About | Mohammed Fayaz";
      descSet = "Learn more about Mohammed Fayaz — background, core skills, and professional experience as a .NET Full Stack Developer.";
    } else if (tab === "products") {
      titleSet = "Projects | Mohammed Fayaz";
      descSet = "Curated showcase of personal projects and self-hosted tools built by Mohammed Fayaz.";
    } else if (tab === "services") {
      titleSet = "Services | Mohammed Fayaz";
      descSet = "Explore Mohammed Fayaz's technical software development services and areas of consulting expertise.";
    } else if (tab === "uses") {
      titleSet = "Uses | Mohammed Fayaz";
      descSet = "Take a look at the languages, developer tools, setups, and frameworks Mohammed Fayaz uses.";
    } else if (tab === "privacy") {
      titleSet = "Privacy Policy | Mohammed Fayaz";
      descSet = "Privacy policy details for Mohammed Fayaz's portfolio website and secure user data handling.";
    } else if (tab === "faq") {
      titleSet = "FAQ | Mohammed Fayaz";
      descSet = "Frequently Asked Questions about Mohammed Fayaz's .NET and Full Stack development expertise.";
    } else if (tab === "contact") {
      titleSet = "Contact | Mohammed Fayaz";
      descSet = "Get in touch with Mohammed Fayaz for custom developer opportunities, systems design, and agile sprints.";
    } else if (tab === "404") {
      titleSet = "404 Page Not Found | Mohammed Fayaz";
      descSet = "The requested page was not found.";
    }

    document.title = titleSet;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descSet);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    getSiteSettings().then((result) => {
      if (isMounted) {
        setSettings(result);
        // First-time visitors inherit the admin-selected default palette.
        applyAdminDefault(result?.themeSet);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hash-based routing synchronization
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (hash === "" || hash === "home") {
        setActiveTab("home");
        updatePageMetadata("home");
      } else if (hash === "about") {
        setActiveTab("about");
        updatePageMetadata("about");
      } else if (hash === "work" || hash === "company") {
        setActiveTab("work");
        setWorkSubTab("company");
        updatePageMetadata("work");
      } else if (hash === "personal") {
        setActiveTab("work");
        setWorkSubTab("personal");
        updatePageMetadata("work");
      } else if (hash === "products") {
        setActiveTab("work");
        setWorkSubTab("products");
        updatePageMetadata("products");
      } else if (hash === "services") {
        setActiveTab("work");
        setWorkSubTab("services");
        updatePageMetadata("services");
      } else if (hash === "uses") {
        setActiveTab("uses");
        updatePageMetadata("uses");
      } else if (hash === "privacy") {
        setActiveTab("privacy");
        updatePageMetadata("privacy");
      } else if (hash === "faq") {
        setActiveTab("faq");
        updatePageMetadata("faq");
      } else if (hash === "contact") {
        setActiveTab("contact");
        updatePageMetadata("contact");
      } else if (hash.startsWith("admin")) {
        // Handled by top-level Admin router
      } else {
        setActiveTab("404");
        updatePageMetadata("404");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Execute initially
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleNavClick = (tab: "home" | "about" | "work" | "uses" | "privacy" | "faq" | "contact" | "404" | "products" | "services" | "personal" | "company", targetId?: string) => {
    setIsDropdownOpen(false);
    setIsWorkDropdownOpen(false);

    if (tab === "products") {
      setActiveTab("work");
      setWorkSubTab("products");
      window.history.pushState(null, "", "#products");
      scrollTopInstant();
      updatePageMetadata("products");
    } else if (tab === "services") {
      setActiveTab("work");
      setWorkSubTab("services");
      window.history.pushState(null, "", "#services");
      scrollTopInstant();
      updatePageMetadata("services");
    } else if (tab === "personal") {
      setActiveTab("work");
      setWorkSubTab("personal");
      window.history.pushState(null, "", "#personal");
      scrollTopInstant();
      updatePageMetadata("work");
    } else if (tab === "company") {
      setActiveTab("work");
      setWorkSubTab("company");
      window.history.pushState(null, "", "#work");
      scrollTopInstant();
      updatePageMetadata("work");
    } else {
      setActiveTab(tab as any);
      if (tab === "work") {
        setWorkSubTab("company");
      }
      window.history.pushState(null, "", `#${tab}`);
      scrollTopInstant();
      updatePageMetadata(tab as any);
    }

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: -80 });
          else el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div className="app-canvas min-h-screen text-text-primary selection:bg-accent selection:text-accent-foreground">
      <ThemeSidebar open={isThemePanelOpen} onClose={() => setIsThemePanelOpen(false)} />

      {/* Minimal Navigation — transparent (blend) at top, solid blurred bar once scrolled (#1) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] px-5 md:px-8 py-5 md:py-7 flex justify-between items-center select-none transition-colors duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border text-text-primary"
            : "mix-blend-difference text-white"
        }`}
      >
        <span
          className="text-lg font-luxury font-bold tracking-tighter cursor-pointer"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsWorkDropdownOpen(false);
            handleNavClick("home");
          }}
        >
          Fayaz
        </span>
        <div className="flex gap-6 md:gap-8 text-[10px] font-bold uppercase tracking-[0.3em] items-center">
          <button
            id="appearance-trigger-btn"
            onClick={() => setIsThemePanelOpen(true)}
            aria-label="Open appearance settings"
            title="Appearance — theme & mode"
            className="cursor-pointer transition-colors hover:text-accent flex items-center gap-1.5"
          >
            <Palette size={13} />
            <span className="hidden sm:inline">Theme</span>
          </button>
          <div
            className="relative"
            onMouseEnter={() => openMenuOnHover("about")}
            onMouseLeave={scheduleHoverClose}
          >
            <button
              id="nav-about-dropdown-btn"
              onClick={() => {
                setIsWorkDropdownOpen(false);
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isDropdownOpen || ["home", "about", "privacy", "faq"].includes(activeTab) ? "text-accent" : "hover:text-accent"}`}
            >
              <span>Home</span>
              <ChevronDown size={11} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0 opacity-50"}`} />
            </button>
          </div>
          <div
            className="relative"
            onMouseEnter={() => openMenuOnHover("work")}
            onMouseLeave={scheduleHoverClose}
          >
            <button
              id="nav-work-dropdown-btn"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsWorkDropdownOpen(!isWorkDropdownOpen);
              }}
              className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isWorkDropdownOpen || ["work", "uses"].includes(activeTab) ? "text-accent" : "hover:text-accent"}`}
            >
              <span>Work</span>
              <ChevronDown size={11} className={`transition-transform duration-300 ${isWorkDropdownOpen ? "rotate-180" : "rotate-0 opacity-50"}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Pages Router Wrapper with Motion transitions */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {activeTab === "home" && (
          <HomePage master={master} handleNavClick={handleNavClick} />
        )}

        {activeTab === "work" && (
          /* Work / Projects Tab View with Sub Tabs */
          <div className="bg-background min-h-screen">
            {/* Dedicated Work Header */}
            <header className="py-24 lg:py-32 px-5 md:px-8 lg:px-24 bg-surface/40 text-center relative overflow-hidden flex flex-col items-center border-b border-border">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="text-[25vw] font-luxury font-black text-text-secondary/15 select-none">WORK</span>
              </div>
              <div className="z-10 max-w-3xl space-y-4">
                <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.5em] block">
                  C# / .NET / FULL-STACK
                </span>
                <h1 className="text-4xl lg:text-6xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
                  Work &amp; Experience
                </h1>
                <p className="text-sm md:text-base text-text-secondary font-medium max-w-xl mx-auto leading-relaxed">
                  Clean, production-ready enterprise solutions and independent software packages made accessible with robust architecture and quick recruiter scanning.
                </p>
              </div>
            </header>

            {/* Under-header Content Page Container */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">

              {/* Segmented Page Embeds */}
              {(() => {
                if (workSubTab === "products") {
                  return <ProductsPage showOnlyGrid={true} />;
                }
                if (workSubTab === "services") {
                  return <ServicesPage showOnlyGrid={true} />;
                }

                const activeEntries = (master.projects || []).filter(
                  (p: any) => p.type === workSubTab || p.category === workSubTab
                );
                return (
                  <>
                    {/* Recruiter-First Simple/Professional Projects List */}
                    <div className="space-y-5 py-10">
                      {activeEntries.map((project: any, idx: number) => (
                        <ProjectCard key={project.id} project={project} index={idx} />
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Resume Call To Action Bar */}
            <section className="py-16 px-5 md:px-8 lg:px-24 bg-surface/70 text-center rounded-3xl max-w-5xl mx-auto mb-24 border border-border shadow-sm space-y-6">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block">HAVE A VACANCY?</span>
              <h3 className="text-2xl md:text-3xl font-luxury font-medium leading-snug">Let's connect to review enterprise solution needs</h3>
              <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Check details of Fayaz's background, leading agile sprints as a Tech Lead and coding optimized database query structures as a Developer.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleNavClick("home")}
                  className="px-6 py-3 bg-surface border border-border text-text-primary hover:text-accent text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer"
                >
                  Return to Profile Overview
                </button>
                <button
                  onClick={() => handleNavClick("contact")}
                  className="px-6 py-3 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer"
                >
                  Get in Touch
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "about" && <AboutPage handleNavClick={handleNavClick} />}

        {activeTab === "uses" && <UsesPage />}

        {activeTab === "products" && <ProductsPage />}

        {activeTab === "services" && <ServicesPage />}

        {activeTab === "privacy" && <PrivacyPage onBack={() => handleNavClick("home")} />}

        {activeTab === "faq" && <FaqPage />}

        {activeTab === "404" && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center select-none">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-luxury font-bold text-text-primary mb-2 uppercase tracking-tighter">Page Not Found</h2>
            <p className="text-text-secondary text-xs max-w-sm mb-8 leading-relaxed font-sans">
              The hash address route you entered is invalid or does not correspond to an index structure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleNavClick("home")}
                className="px-6 py-2.5 bg-accent text-accent-foreground text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-opacity-80 transition-all cursor-pointer"
              >
                Return to profile
              </button>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-background min-h-[90vh] pt-36 pb-16">
            <div className="max-w-4xl mx-auto space-y-16 px-5 md:px-8 select-none">
              <div className="space-y-6 text-center">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.6em] block">SECURE CONTACT HUB</span>
                <h2 className="text-4xl lg:text-5xl font-luxury font-light tracking-tighter leading-none text-text-primary">
                  Let's discuss critical<br />architectures together.
                </h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest text-center">
                  ESTABLISHED CHANNELS & PIPELINES
                </p>
              </div>
              <ContactForm candidateEmail={settings?.contactEmail || master.candidate.email} />
            </div>
          </div>
        )}

        {/* Contact Section */}
        {activeTab === "home" && (
          <section id="contact" className="py-12 md:py-24 lg:py-36 px-5 md:px-8 lg:px-24 text-center bg-surface/30 border-t border-border relative">
            <div className="md:hidden max-w-sm mx-auto space-y-5">
              <h2 className="text-2xl font-luxury font-semibold tracking-tight leading-tight text-text-primary">
                Ready to talk about a role or project?
              </h2>
              <button
                onClick={() => handleNavClick("contact")}
                className="w-full px-5 py-3 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer"
              >
                Open Contact Form
              </button>
            </div>

            <div className="hidden md:block max-w-4xl mx-auto space-y-16">
              <div className="space-y-6">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.6em] block">SECURE CONTACT</span>
                <h2 className="text-4xl lg:text-6xl font-luxury font-light tracking-tighter leading-none text-text-primary">
                  Let's build something <br /> timeless together.
                </h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest">
                  ESTABLISHED CHANNELS & PIPELINES
                </p>
              </div>

              {/* Embedded Contact Form Component */}
              <ContactForm candidateEmail={settings?.contactEmail || master.candidate.email} />

              <div className="pt-8 flex justify-center items-center border-t border-border max-w-2xl mx-auto text-text-primary">
                <div className="text-center">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Direct Correspondence</span>
                  <a href={`mailto:${settings?.contactEmail || master.candidate.email}`} className="text-lg font-luxury font-medium text-text-primary hover:text-accent transition-colors border-b border-border hover:border-accent pb-0.5">
                    {settings?.contactEmail || master.candidate.email}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-16 pb-8 px-5 md:px-8 lg:px-24 border-t border-border bg-background select-none">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:gap-6">
              {/* Brand block */}
              <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                <span className="text-lg font-luxury font-bold tracking-tighter text-text-primary">
                  {settings?.name || master.candidate.name}
                </span>
                <p className="text-[11px] text-text-secondary leading-relaxed max-w-xs font-medium">
                  A .NET full-stack developer building scalable, production-ready systems from database to UI.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={settings?.socialLinks.linkedin || master.candidate.linkedin}
                    target="_blank" rel="noreferrer" id="footer-linkedin-link" aria-label="LinkedIn"
                    className="p-2 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                  >
                    <Linkedin size={14} />
                  </a>
                  <a
                    href={settings?.socialLinks.github || master.candidate.github}
                    target="_blank" rel="noreferrer" id="footer-github-link" aria-label="GitHub"
                    className="p-2 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                  >
                    <Github size={14} />
                  </a>
                  {(settings?.blog || master.candidate.blog) && (
                    <a
                      href={settings?.blog || master.candidate.blog}
                      target="_blank" rel="noreferrer" id="footer-blog-link" aria-label="Blog"
                      className="p-2 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                    >
                      <BookOpen size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Explore column */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-[0.25em]">Explore</span>
                <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-text-secondary">
                  {[
                    { label: "Home", tab: "home" as const },
                    { label: "Experience", tab: "company" as const },
                    { label: "Projects", tab: "products" as const },
                    { label: "Services", tab: "services" as const },
                  ].map((l) => (
                    <button
                      key={l.label}
                      onClick={() => handleNavClick(l.tab)}
                      className="text-left hover:text-accent transition-colors w-fit"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info column */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-[0.25em]">Info</span>
                <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-text-secondary">
                  {[
                    { label: "Uses", tab: "uses" as const },
                    { label: "FAQ", tab: "faq" as const },
                    { label: "Privacy Policy", tab: "privacy" as const },
                  ].map((l) => (
                    <button
                      key={l.label}
                      onClick={() => handleNavClick(l.tab)}
                      className="text-left hover:text-accent transition-colors w-fit"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact column */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-[0.25em]">Contact</span>
                <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-text-secondary">
                  <button onClick={() => handleNavClick("contact")} className="text-left hover:text-accent transition-colors w-fit">
                    Start a conversation
                  </button>
                  <a href={`mailto:${settings?.contactEmail || master.candidate.email}`} className="hover:text-accent transition-colors break-all">
                    {settings?.contactEmail || master.candidate.email}
                  </a>
                  <span className="text-text-secondary/80 uppercase tracking-[0.15em] text-[10px]">
                    {(settings?.location || master.candidate.location)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
                  © {new Date().getFullYear()} {settings?.name || master.candidate.name}. All rights reserved.
                </span>
                <a
                  id="admin-login-lock-btn"
                  href="#admin/login"
                  className="text-text-secondary/70 hover:text-accent p-1 rounded-md hover:bg-surface/65 transition-colors cursor-pointer"
                  title="Admin"
                >
                  <Lock size={11} />
                </a>
              </div>
              <span className="text-[10px] font-bold text-text-secondary/80 uppercase tracking-[0.2em]">
                Built with React, Tailwind &amp; .NET
              </span>
            </div>
          </div>
        </footer>
      </motion.div>

      {/* Dropdown Overlay for About navigation tab */}
      {isDropdownOpen && (
        <>
          {/* Invisible backdrop to capture outside clicks. z BELOW the nav (#3) so the nav
              buttons stay clickable while a menu is open — previously it sat above the nav and
              swallowed the first tap on Work. */}
          <div
            id="nav-dropdown-backdrop"
            className="fixed inset-0 z-[90] bg-transparent"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div
            id="nav-about-dropdown"
            onMouseEnter={cancelHoverClose}
            onMouseLeave={scheduleHoverClose}
            className="fixed top-20 right-4 md:right-16 lg:right-24 z-[150] w-[290px] md:w-[320px] bg-surface border border-border rounded-[28px] shadow-2xl p-4 text-left select-none text-text-primary"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("home");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Home</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Profile overview, skills, and experience</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("about");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">About</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Background, skills, and experience details</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("privacy");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Shield size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Privacy Policy</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">See how we handle your data</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("faq");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <HelpCircle size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">FAQ</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Common questions and answers</p>
                </div>
              </button>

              <div className="border-t border-border mt-2 pt-2.5 px-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a
                    id="admin-dropdown-lock-btn"
                    href="#admin/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 text-[9px] font-bold text-text-secondary hover:text-accent uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Lock size={10} />
                    <span>Admin Access</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dropdown Overlay for Work navigation tab */}
      {isWorkDropdownOpen && (
        <>
          {/* Invisible backdrop — z below nav so nav stays clickable while open (#3). */}
          <div
            id="nav-work-dropdown-backdrop"
            className="fixed inset-0 z-[90] bg-transparent"
            onClick={() => setIsWorkDropdownOpen(false)}
          />
          <div
            id="nav-work-dropdown"
            onMouseEnter={cancelHoverClose}
            onMouseLeave={scheduleHoverClose}
            className="fixed top-20 right-4 md:right-10 lg:right-16 z-[150] w-[290px] md:w-[320px] bg-surface border border-border rounded-[28px] shadow-2xl p-4 text-left select-none text-text-primary"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsWorkDropdownOpen(false);
                  handleNavClick("company");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Experience</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Companies I've worked with and shipped for</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsWorkDropdownOpen(false);
                  handleNavClick("products");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Wrench size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Projects</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Personal builds and side projects I own</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsWorkDropdownOpen(false);
                  handleNavClick("services");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Services</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">SaaS design and specialized consulting</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsWorkDropdownOpen(false);
                  handleNavClick("uses");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Wrench size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Uses</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Tools, gear, and software I use daily</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Portfolio5;
