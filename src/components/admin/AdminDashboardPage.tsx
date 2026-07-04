import React, { useEffect, useState } from "react";
import { getEntries, getFaqItems, getUsesCategories, getSiteSettings, getServices } from "../../services/api";
import { Briefcase, HelpCircle, Wrench, ShieldCheck, Plus, ExternalLink, ListCollapse, Package, Sparkles } from "lucide-react";
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
      desc: "Live in public #work page"
    },
    {
      label: "Products Catalog",
      value: productCount,
      icon: Package,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      desc: "Live in public #products page"
    },
    {
      label: "Verified FAQs",
      value: faqCount,
      icon: HelpCircle,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      desc: "Coming fully on Phase 3b"
    },
    {
      label: "Consulting Services",
      value: servicesCount,
      icon: Sparkles,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      desc: "Live expertise sectors"
    },
    {
      label: "Uses Equipment Items",
      value: usesCount,
      icon: Wrench,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      desc: "Infrastructure gear list"
    }
  ];

  return (
    <div id="admin-dashboard-root" className="space-y-10 animate-fade-in text-left">
      
      {/* Intro Banner Card */}
      <div className="p-8 md:p-10 bg-surface border border-border rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-luxury font-bold tracking-tight text-text-primary">
              Welcome back, Administrator
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              You are authorized to manage Mohammed Fayaz's portfolio specifications.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>Active Session Authorized</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between text-xs font-semibold text-text-secondary gap-2.5">
          <div>
            <span className="font-bold text-text-primary block sm:inline">Database Link:</span>{" "}
            <span className="font-mono text-[11px] bg-background px-2 py-0.5 rounded border border-border">
              {apiMode}
            </span>
          </div>
          <div>
            <span className="font-bold text-text-primary">Administrative Mail:</span> {contactEmail}
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-surface p-6 rounded-2xl border border-border flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <span className="text-4xl font-luxury font-bold text-text-primary">
                  {stat.value}
                </span>
                <span className="text-[10px] font-semibold text-text-secondary block mt-1">
                  {stat.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Shortcut Control Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Rapid Access Board */}
        <div className="bg-surface p-8 rounded-3xl border border-border lg:col-span-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-luxury font-bold uppercase tracking-wide">
              Management Pipelines
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Select an action to add or edit components in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Shortcut: Create Entry */}
            <a 
              href="#admin/entries/new"
              className="p-5 bg-background hover:bg-background/80 border border-border hover:border-accent rounded-2xl flex items-start gap-4 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <Plus size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span>Add Portfolio Entry</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                  Inject a new professional work experience or personal app directly into public tabs.
                </p>
              </div>
            </a>

            {/* Shortcut: List Entries */}
            <a 
              href="#admin/entries"
              className="p-5 bg-background hover:bg-background/80 border border-border hover:border-accent rounded-2xl flex items-start gap-4 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-text-primary/5 rounded-xl flex items-center justify-center text-text-primary shrink-0">
                <ListCollapse size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span>List Portfolio Entries</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                  Browse, review details, update or delete entries in the unified database layout.
                </p>
              </div>
            </a>

            {/* Shortcut: Manage Services */}
            <a 
              href="#admin/services"
              className="p-5 bg-background hover:bg-background/80 border border-border hover:border-accent rounded-2xl flex items-start gap-4 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span>Manage Services</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                  Add, update or purge the consulting specialties, taglines, and live badges.
                </p>
              </div>
            </a>

          </div>
        </div>

        {/* Right Side: Quick System Monitor details */}
        <div className="bg-surface p-8 rounded-3xl border border-border lg:col-span-4 space-y-6">
          <div className="border-b border-border pb-4">
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
