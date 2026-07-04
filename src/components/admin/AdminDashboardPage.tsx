import React, { useEffect, useState } from "react";
import { getEntries, getFaqItems, getUsesCategories, getSiteSettings, getServices } from "../../services/api";
import {
  Briefcase,
  HelpCircle,
  Wrench,
  ShieldCheck,
  Plus,
  ExternalLink,
  ListCollapse,
  Package,
  Sparkles,
  User,
  Settings,
  Image as ImageIcon,
} from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";

export const AdminDashboardPage: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number | string>("—");
  const [productCount, setProductCount] = useState<number | string>("—");
  const [faqCount, setFaqCount] = useState<number | string>("—");
  const [usesCount, setUsesCount] = useState<number | string>("—");
  const [servicesCount, setServicesCount] = useState<string>("—");
  const [loading, setLoading] = useState(true);
  const [apiMode, setApiMode] = useState("Remote API Required");
  const [contactEmail, setContactEmail] = useState("fayaz@example.com");

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const [entries, faqs, uses, settings, services] = await Promise.all([
          getEntries().catch(() => []),
          getFaqItems().catch(() => []),
          getUsesCategories().catch(() => []),
          getSiteSettings().catch(() => null),
          getServices().catch(() => [])
        ]);

        if (isMounted) {
          const companiesCount = entries.filter((e) => e.type === "company").length;
          const personalsCount = entries.filter((e) => e.type === "personal").length;
          setProjectCount(companiesCount);
          setProductCount(personalsCount);
          setFaqCount(faqs.length);

          const activeServices = (services || []).filter((s: any) => s.status === "Active").length;
          const totalServices = (services || []).length;
          setServicesCount(`${activeServices} active / ${totalServices} total`);
          
          // Calculate sum of dev tools/items in uses list
          const totalUsesItems = (uses || []).reduce((sum: number, cat) => sum + (cat.items?.length || 0), 0);
          setUsesCount(totalUsesItems || "—");

          if (settings?.contactEmail) {
            setContactEmail(settings.contactEmail);
          }

          const apiBase = (import.meta as any).env.VITE_API_BASE_URL;
          setApiMode(apiBase ? `Connected to Remote API (${apiBase})` : "Remote API not configured");
        }
      } catch (err) {
        console.error("Dashboard failed to load specs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const statCards = [
    {
      label: "Engineered Projects",
      value: projectCount,
      icon: Briefcase,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      desc: "Professional experience entries",
      href: "#admin/entries"
    },
    {
      label: "Products Catalog",
      value: productCount,
      icon: Package,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      desc: "Personal builds and apps",
      href: "#admin/entries"
    },
    {
      label: "Verified FAQs",
      value: faqCount,
      icon: HelpCircle,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      desc: "Published question answers",
      href: "#admin/faq"
    },
    {
      label: "Consulting Services",
      value: servicesCount,
      icon: Sparkles,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      desc: "Expertise offers and badges",
      href: "#admin/services"
    },
    {
      label: "Uses Equipment Items",
      value: usesCount,
      icon: Wrench,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      desc: "Tools, gear, and stack items",
      href: "#admin/uses"
    }
  ];

  const managementActions = [
    {
      title: "Add Portfolio Entry",
      href: "#admin/entries/new",
      icon: Plus,
      desc: "Create a new experience entry or personal project.",
      tone: "text-accent bg-accent/10 border-accent/20"
    },
    {
      title: "Portfolio Entries",
      href: "#admin/entries",
      icon: ListCollapse,
      desc: "Edit experience, project details, links, tech, and impact points.",
      tone: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Services",
      href: "#admin/services",
      icon: Sparkles,
      desc: "Maintain consulting services, ordering, descriptions, and highlights.",
      tone: "text-pink-500 bg-pink-500/10 border-pink-500/20"
    },
    {
      title: "About",
      href: "#admin/about",
      icon: User,
      desc: "Update profile copy, perspective content, skills, and timeline.",
      tone: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Media",
      href: "#admin/media",
      icon: ImageIcon,
      desc: "Manage hero background and profile images for desktop and mobile.",
      tone: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      title: "Settings",
      href: "#admin/settings",
      icon: Settings,
      desc: "Change identity, contact, social links, resume, and default theme.",
      tone: "text-slate-500 bg-slate-500/10 border-slate-500/20"
    },
    {
      title: "FAQ",
      href: "#admin/faq",
      icon: HelpCircle,
      desc: "Write simple answers recruiters and clients can scan quickly.",
      tone: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Uses",
      href: "#admin/uses",
      icon: Wrench,
      desc: "Organize tools, frameworks, editor setup, and hardware.",
      tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Privacy",
      href: "#admin/privacy",
      icon: ShieldCheck,
      desc: "Maintain policy sections and visitor data guidance.",
      tone: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    }
  ];

  return (
    <div id="admin-dashboard-root" className="space-y-6 md:space-y-8 animate-fade-in text-left">
      
      {/* Intro Banner Card */}
      <div className="p-4 md:p-6 bg-surface border border-border rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-luxury font-bold tracking-tight text-text-primary">
              Welcome back, Administrator
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              You are authorized to manage Mohammed Fayaz's portfolio specifications.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 text-[9px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>Active Session Authorized</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border grid grid-cols-1 md:grid-cols-2 text-[11px] font-semibold text-text-secondary gap-2.5">
          <div>
            <span className="font-bold text-text-primary block sm:inline">Database Link:</span>{" "}
            <span className="font-mono text-[10px] bg-background px-2 py-0.5 rounded border border-border break-all">
              {apiMode}
            </span>
          </div>
          <div>
            <span className="font-bold text-text-primary">Administrative Mail:</span> {contactEmail}
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <a
              key={i} 
              href={stat.href}
              className="group bg-surface p-3 md:p-4 rounded-xl border border-border flex items-start gap-3 hover:border-accent/45 hover:shadow-md transition-all text-left min-h-32"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary leading-snug">
                    {stat.label}
                  </span>
                  <ExternalLink size={12} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <span className="text-xl md:text-2xl font-luxury font-bold text-text-primary block mt-2 leading-tight break-words">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-[11px] font-semibold text-text-secondary block mt-1 leading-snug">
                  {stat.desc}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Primary Shortcut Control Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Side: Rapid Access Board */}
        <div className="bg-surface p-4 md:p-6 rounded-2xl border border-border lg:col-span-8 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-luxury font-bold uppercase tracking-wide">
              Dashboard Actions
            </h3>
            <p className="text-xs text-text-secondary mt-1 hidden sm:block">
              Open the exact workspace you need without hunting through navigation.
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {managementActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.href}
                  href={action.href}
                  className="p-3 bg-background hover:bg-surface border border-border hover:border-accent/50 rounded-xl flex flex-col sm:flex-row items-start gap-2.5 transition-all duration-200 group text-left cursor-pointer min-h-28"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${action.tone}`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-[11px] md:text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 leading-snug">
                      <span>{action.title}</span>
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </h4>
                    <p className="text-[10px] md:text-[11px] text-text-secondary font-medium leading-snug hidden sm:block">
                      {action.desc}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick System Monitor details */}
        <div className="bg-surface p-4 md:p-6 rounded-2xl border border-border lg:col-span-4 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-luxury font-bold uppercase tracking-wide">
              Infrastructure Status
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Configuration credentials state
            </p>
          </div>

          <ul className="space-y-3.5 text-xs">
            <li className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-text-secondary font-semibold">User Role</span>
              <span className="font-bold text-text-primary uppercase tracking-widest text-[9px] bg-background px-2.5 py-1 rounded border border-border">Master Administrator</span>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-text-secondary font-semibold">Deployment Env</span>
              <span className="font-mono text-text-primary">Cloud Run</span>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-text-secondary font-semibold">Storage Source</span>
              <span className="font-semibold text-accent">Cloudflare R2 CMS</span>
            </li>
            <li className="flex justify-between items-center py-1.5">
              <span className="text-text-secondary font-semibold">Phase 3b Ready</span>
              <span className="font-semibold text-text-secondary">Pending release</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
