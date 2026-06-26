import React from "react";
import { motion } from "motion/react";
import { PortfolioData } from "../models/portfolio.model";
import { ProjectCard, ProjectData } from "./ProjectCard";
import { ContactForm } from "./ContactForm";

const WORK_PROJECTS: ProjectData[] = [
  // Tab 1: Revalsys Technologies Projects
  {
    id: "hcm",
    name: "Healthcare Management System (HCM)",
    category: "company",
    companyName: "Revalsys Technologies",
    role: "Team Lead + .NET Developer",
    timeline: "Feb 2023 — Dec 2023",
    shortOverview: "A centralized web-based Healthcare ERP designed to streamline multi-facility administration, doctor schedules, and digital prescription processing.",
    responsibilities: [
      "Built patient registration pipelines and high-security digital prescription flows.",
      "Developed custom request rules preventing doctor reservation overlaps.",
      "Allocated tasks across a 5-developer agile team and implemented code formatting standards."
    ],
    techStack: ["C#", "ASP.NET Core", "Web API", "SQL Server"]
  },
  {
    id: "hrms",
    name: "Requisition & Onboarding System (HRMS)",
    category: "company",
    companyName: "Revalsys Technologies",
    role: "Team Lead + .NET Developer",
    timeline: "Jan 2024 — Aug 2024",
    shortOverview: "A comprehensive Human Resource Management portal automating applicant recruitment pipelines, screen workflows, and post-offer candidate onboarding checklists.",
    responsibilities: [
      "Designed dynamic applicant state stages mapping job descriptions to agent consultants.",
      "Configured multi-role interview panels and secure centralized feedback submission sheets.",
      "Directed 5 developers in delivering secure, automated onboarding validation and compliance checks."
    ],
    techStack: ["C#", "ASP.NET Core", "Web API", "SQL Server"]
  },
  {
    id: "trusterra",
    name: "TrusTerra (Vehicle Marketplace & Inspection Platform)",
    category: "company",
    companyName: "Revalsys Technologies",
    role: ".NET Developer",
    timeline: "Sep 2024 — May 2026",
    shortOverview: "An interactive peer-to-peer used car marketplace with rigorous inspector checklists, live push alerts, and direct buyer-to-seller connections.",
    responsibilities: [
      "Constructed a granular vehicle assessment checklist to document car health metrics.",
      "Integrated Firebase Cloud Messaging (FCM) to trigger instant push notifications for buyer inquiries.",
      "Optimized relational query patterns under SQL Server for rapid client-side catalog searches."
    ],
    techStack: ["C#", "ASP.NET Core", "Web API", "SQL Server", "Firebase FCM"]
  },

  // Tab 2: Personal Products
  {
    id: "gowithflow",
    name: "Go With Flow (Kanban Portfolio Board)",
    category: "personal",
    role: "Creator & Frontend Lead",
    timeline: "2024 — 2025",
    shortOverview: "A frictionless project tracking board and Kanban visualizer built to assist developers in planning work, tracking deadlines, and managing workflows.",
    responsibilities: [
      "Implemented dynamic drag-and-drop state boards allowing visual priority adjustments.",
      "Developed lazy-loaded layout models ensuring instant client-side transitions.",
      "Added automated visual warnings to spot overdue milestones or blocked boards."
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "motion", "LocalStorage"]
  },
  {
    id: "familyfirst",
    name: "Family First (Cooperative Care Hub)",
    category: "personal",
    role: "Full-Stack Creator",
    timeline: "2025",
    shortOverview: "A secure cooperative ecosystem enabling active families to organize tasks, log health checkups, and dispatch private safety notices.",
    responsibilities: [
      "Coded secure private logging registers and shared helper calendars strictly for invited family circles.",
      "Configured reactive high-priority mobile alert alerts to support real-time family responses.",
      "Created sleek layouts featuring high-contrast typography, fully accessible across tablet and mobile displays."
    ],
    techStack: ["React", "C#", "ASP.NET Core", "SQL Server", "Tailwind CSS"]
  }
];
import { UsesPage } from "./UsesPage";
import { AboutPage } from "./AboutPage";
import { PrivacyPage } from "./PrivacyPage";
import { FaqPage } from "./FaqPage";
import { ProductsPage } from "./ProductsPage";
import { ServicesPage } from "./ServicesPage";
import { Github, Linkedin, BookOpen, User, Wrench, Mail, Shield, HelpCircle, ChevronDown, Sparkles, Lock, Briefcase, Package } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SiteSettings } from "../models/portfolio.model";
import { getSiteSettings } from "../services/api";

interface Portfolio5Props {
  data: PortfolioData;
}

export const Portfolio5: React.FC<Portfolio5Props> = ({ data }) => {
  const { master, transaction } = data;

  const [activeTab, setActiveTab] = React.useState<"about" | "work" | "uses" | "privacy" | "faq" | "contact" | "404" | "products" | "services">("about");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = React.useState(false);
  const [workSubTab, setWorkSubTab] = React.useState<"company" | "personal" | "products" | "services">("personal");
  const [selectedCategoryTag, setSelectedCategoryTag] = React.useState<string>("All");
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);

  // Dynamic Metadata Sync Helper
  const updatePageMetadata = (tab: string) => {
    let titleSet = "Mohammed Fayaz | .NET Full Stack Developer";
    let descSet = "Mohammed Fayaz — .NET Full Stack Developer with 3+ years building scalable healthcare, HRMS and SaaS applications using ASP.NET Core, Angular and SQL Server.";

    if (tab === "work") {
      titleSet = "Work | Mohammed Fayaz";
      descSet = "Healthcare, HRMS, and marketplace platform projects by Mohammed Fayaz.";
    } else if (tab === "products") {
      titleSet = "Products | Mohammed Fayaz";
      descSet = "Curated showcase of side projects and self-hosted tools created by Mohammed Fayaz.";
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
      if (hash === "" || hash === "about") {
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

  const handleNavClick = (tab: "about" | "work" | "uses" | "privacy" | "faq" | "contact" | "404" | "products" | "services" | "personal" | "company", targetId?: string) => {
    setIsDropdownOpen(false);
    setIsWorkDropdownOpen(false);

    if (tab === "products") {
      setActiveTab("work");
      setWorkSubTab("products");
      window.history.pushState(null, "", "#products");
      window.scrollTo({ top: 0, behavior: 'instant' });
      updatePageMetadata("products");
    } else if (tab === "services") {
      setActiveTab("work");
      setWorkSubTab("services");
      window.history.pushState(null, "", "#services");
      window.scrollTo({ top: 0, behavior: 'instant' });
      updatePageMetadata("services");
    } else if (tab === "personal") {
      setActiveTab("work");
      setWorkSubTab("personal");
      window.history.pushState(null, "", "#personal");
      window.scrollTo({ top: 0, behavior: 'instant' });
      updatePageMetadata("work");
    } else if (tab === "company") {
      setActiveTab("work");
      setWorkSubTab("company");
      window.history.pushState(null, "", "#work");
      window.scrollTo({ top: 0, behavior: 'instant' });
      updatePageMetadata("work");
    } else {
      setActiveTab(tab as any);
      if (tab === "work") {
        setWorkSubTab("company");
      }
      window.history.pushState(null, "", `#${tab}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
      updatePageMetadata(tab as any);
    }

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent selection:text-accent-foreground">
      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-8 flex justify-between items-center mix-blend-difference text-white select-none">
        <span 
          className="text-lg font-luxury font-bold tracking-tighter cursor-pointer"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsWorkDropdownOpen(false);
            handleNavClick("about");
          }}
        >
          MF.
        </span>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] items-center">
          <ThemeToggle />
          <div className="relative">
            <button 
              id="nav-about-dropdown-btn"
              onClick={() => {
                setIsWorkDropdownOpen(false);
                setIsDropdownOpen(!isDropdownOpen);
              }} 
              className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isDropdownOpen || ["about", "uses", "privacy", "faq"].includes(activeTab) ? "text-accent" : "hover:text-accent"}`}
            >
              <span>About</span>
              <ChevronDown size={11} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0 text-white/50"}`} />
            </button>
          </div>
          <div className="relative">
            <button 
              id="nav-work-dropdown-btn"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsWorkDropdownOpen(!isWorkDropdownOpen);
              }} 
              className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isWorkDropdownOpen || activeTab === "work" ? "text-accent" : "hover:text-accent"}`}
            >
              <span>Work</span>
              <ChevronDown size={11} className={`transition-transform duration-300 ${isWorkDropdownOpen ? "rotate-180" : "rotate-0 text-white/50"}`} />
            </button>
          </div>
          <button 
            onClick={() => {
              setIsDropdownOpen(false);
              setIsWorkDropdownOpen(false);
              handleNavClick("contact");
            }} 
            className={`cursor-pointer transition-colors ${activeTab === "contact" ? "text-accent" : "hover:text-accent"}`}
          >
            Contact
          </button>
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
        {activeTab === "about" && (
          <AboutPage master={master} handleNavClick={handleNavClick} />
        )}

        {activeTab === "work" && (
          /* Work / Projects Tab View with Sub Tabs */
          <div className="bg-background min-h-screen">
            {/* Dedicated Work Header */}
            <header className="py-24 lg:py-32 px-8 lg:px-24 bg-surface/40 text-center relative overflow-hidden flex flex-col items-center border-b border-border">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="text-[25vw] font-luxury font-black text-text-secondary/15 select-none">WORK</span>
              </div>
              <div className="z-10 max-w-3xl space-y-4">
                <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.5em] block">
                  C# / .NET / FULL-STACK
                </span>
                <h1 className="text-4xl lg:text-6xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
                  Shipped Systems
                </h1>
                <p className="text-sm md:text-base text-text-secondary font-medium max-w-xl mx-auto leading-relaxed">
                  Clean, production-ready enterprise solutions and independent software packages made accessible with robust architecture and quick recruiter scanning.
                </p>
              </div>
            </header>

            {/* Under-header Content Page Container */}
            <div className="max-w-5xl mx-auto px-6 md:px-8 pt-8">

              {/* Sub-filtering pills / Segmented Page Embeds */}
              {(() => {
                if (workSubTab === "products") {
                  return <ProductsPage showOnlyGrid={true} />;
                }
                if (workSubTab === "services") {
                  return <ServicesPage showOnlyGrid={true} />;
                }

                const activeEntries = (master.projects || WORK_PROJECTS).filter(
                  (p: any) => 
                    (p.type === workSubTab || p.category === workSubTab) &&
                    p.id !== "coolzo" && 
                    p.id !== 4 && 
                    p.id !== "4" &&
                    !(p.name || p.title || "").toLowerCase().includes("coolzo") &&
                    !(p.name || p.title || "").toLowerCase().includes("pulsetrack")
                );
                const availableTags = [
                  "All",
                  ...Array.from(
                    new Set(
                      activeEntries
                        .map((p: any) => p.categoryTag || p.domain)
                        .filter(Boolean)
                    )
                  )
                ];
                const filteredEntries =
                  selectedCategoryTag === "All"
                    ? activeEntries
                    : activeEntries.filter(
                        (p: any) =>
                          (p.categoryTag || p.domain) === selectedCategoryTag
                      );

                return (
                  <>
                    {availableTags.length > 2 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto px-4">
                        {availableTags.map((tag: any) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedCategoryTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                              selectedCategoryTag === tag
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "bg-surface text-text-secondary hover:text-text-primary border border-border"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recruiter-First Simple/Professional Projects List */}
                    <div className="space-y-10 py-12">
                      {filteredEntries.map((project: any, idx: number) => (
                        <ProjectCard key={project.id} project={project} index={idx} />
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Resume Call To Action Bar */}
            <section className="py-16 px-8 lg:px-24 bg-surface/70 text-center rounded-3xl max-w-5xl mx-auto mb-24 border border-border shadow-sm space-y-6">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block">HAVE A VACANCY?</span>
              <h3 className="text-2xl md:text-3xl font-luxury font-medium leading-snug">Let's connect to review enterprise solution needs</h3>
              <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Check details of Fayaz's background, leading agile sprints as a Tech Lead and coding optimized database query structures as a Developer.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleNavClick("about")}
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

        {activeTab === "uses" && <UsesPage />}

        {activeTab === "products" && <ProductsPage />}

        {activeTab === "services" && <ServicesPage />}

        {activeTab === "privacy" && <PrivacyPage onBack={() => handleNavClick("about")} />}

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
                onClick={() => handleNavClick("about")}
                className="px-6 py-2.5 bg-accent text-accent-foreground text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-opacity-80 transition-all cursor-pointer"
              >
                Return to profile
              </button>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-background min-h-[90vh] pt-36 pb-16">
            <div className="max-w-4xl mx-auto space-y-16 px-8 select-none">
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
        {(activeTab === "about" || activeTab === "work") && (
          <section id="contact" className="py-24 lg:py-36 px-8 lg:px-24 text-center bg-surface/30 border-t border-border relative">
            <div className="max-w-4xl mx-auto space-y-16">
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

              <div className="pt-8 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 border-t border-border max-w-2xl mx-auto text-text-primary">
                <div className="text-center md:text-left">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Direct Correspondence</span>
                  <a href={`mailto:${settings?.contactEmail || master.candidate.email}`} className="text-lg font-luxury font-medium text-text-primary hover:text-accent transition-colors border-b border-border hover:border-accent pb-0.5">
                    {settings?.contactEmail || master.candidate.email}
                  </a>
                </div>
                <div className="h-px w-8 md:h-10 md:w-px bg-border" />
                <div className="text-center md:text-left">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Secure Telephone Link</span>
                  <p className="text-lg font-luxury font-medium text-text-primary tracking-wider font-sans select-all">{settings?.socialLinks.mobile || master.candidate.phone}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-16 px-8 lg:px-24 border-t border-border bg-background select-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-luxury font-bold tracking-tighter text-text-primary">MF.</span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.25em]">© {new Date().getFullYear()}</span>
                <a 
                  id="admin-login-lock-btn"
                  href="#admin/login" 
                  className="text-text-secondary hover:text-accent p-1.5 rounded-lg hover:bg-surface/65 transition-colors cursor-pointer"
                  title="Administrative Gateway Client"
                >
                  <Lock size={11} />
                </a>
              </div>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{master.candidate.name}</p>
            </div>

            <div className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.3em] font-sans text-center">
              HYDERABAD, TELANGANA, INDIA
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] font-semibold text-text-secondary">
              <a 
                href={settings?.socialLinks.linkedin || master.candidate.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-accent transition-all duration-300 ease-out"
                id="footer-linkedin-link"
              >
                <Linkedin size={13} className="text-text-secondary group-hover:text-accent transition-colors duration-300" />
                <span className="font-bold uppercase tracking-[0.2em] text-[10px]">LinkedIn</span>
              </a>

              <a 
                href={settings?.socialLinks.github || master.candidate.github} 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-accent transition-all duration-300 ease-out"
                id="footer-github-link"
              >
                <Github size={13} className="text-text-secondary group-hover:text-accent transition-colors duration-300" />
                <span className="font-bold uppercase tracking-[0.2em] text-[10px]">GitHub</span>
              </a>

              {master.candidate.blog && (
                <a 
                  href={master.candidate.blog} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-accent transition-all duration-300 ease-out"
                  id="footer-blog-link"
                >
                  <BookOpen size={13} className="text-text-secondary group-hover:text-accent transition-colors duration-300" />
                  <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Technical Blog</span>
                </a>
              )}
            </div>
          </div>
        </footer>
      </motion.div>

      {/* Dropdown Overlay for About navigation tab */}
      {isDropdownOpen && (
        <>
          {/* Invisible backdrop to capture click outsides */}
          <div 
            id="nav-dropdown-backdrop"
            className="fixed inset-0 z-[140] bg-transparent" 
            onClick={() => setIsDropdownOpen(false)} 
          />
          <div 
            id="nav-about-dropdown"
            className="fixed top-20 right-4 md:right-16 lg:right-24 z-[150] w-[290px] md:w-[320px] bg-surface border border-border rounded-[28px] shadow-2xl p-4 text-left select-none text-text-primary"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("about");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">About</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Learn about Fayaz and his mission</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
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

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("services");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Services</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">My technical expertise and offerings</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleNavClick("contact");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Mail size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Contact</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Get in touch with Fayaz</p>
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
          {/* Invisible backdrop to capture click outsides */}
          <div 
            id="nav-work-dropdown-backdrop"
            className="fixed inset-0 z-[140] bg-transparent" 
            onClick={() => setIsWorkDropdownOpen(false)} 
          />
          <div 
            id="nav-work-dropdown"
            className="fixed top-20 right-4 md:right-10 lg:right-16 z-[150] w-[290px] md:w-[320px] bg-surface border border-border rounded-[28px] shadow-2xl p-4 text-left select-none text-text-primary"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsWorkDropdownOpen(false);
                  handleNavClick("personal");
                }}
                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-surface/80 transition-all duration-300 cursor-pointer text-left w-full"
              >
                <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors shrink-0">
                  <Wrench size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Projects</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Custom tools and priority boards</p>
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
                  <Package size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors leading-normal uppercase tracking-wider">Products</h4>
                  <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">Our ready-to-deploy software packages</p>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Portfolio5;
