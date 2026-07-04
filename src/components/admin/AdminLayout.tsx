import React, { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  User,
  HelpCircle,
  Wrench,
  Shield,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { logout } from "../../services/api";
import { useTheme } from "../ThemeProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSub: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSub }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    window.location.hash = "#admin/login";
  };

  const menuItems = [
    { label: "Dashboard", id: "dashboard", icon: LayoutDashboard, route: "#admin" },
    { label: "Portfolio Nodes", id: "entries", icon: Briefcase, route: "#admin/entries" },
    { label: "About", id: "about", icon: User, route: "#admin/about" },
    { label: "FAQ", id: "faq", icon: HelpCircle, route: "#admin/faq" },
    { label: "Services", id: "services", icon: Sparkles, route: "#admin/services" },
    { label: "Uses", id: "uses", icon: Wrench, route: "#admin/uses" },
    { label: "Privacy", id: "privacy", icon: Shield, route: "#admin/privacy" },
    { label: "Settings", id: "settings", icon: Settings, route: "#admin/settings" },
  ];

  // #9 — mobile bottom tab bar: four primary tabs + a "More" sheet for the rest.
  const primaryIds = ["dashboard", "entries", "services", "settings"];
  const primaryItems = primaryIds.map((id) => menuItems.find((m) => m.id === id)!);
  const moreItems = menuItems.filter((m) => !primaryIds.includes(m.id));

  const getActiveItem = () => {
    if (activeSub === "dashboard") return "dashboard";
    if (activeSub.startsWith("entry") || activeSub.startsWith("projects") || activeSub.startsWith("products")) return "entries";
    if (activeSub.startsWith("placeholder-")) {
      return activeSub.replace("placeholder-", "");
    }
    return activeSub;
  };

  const activeId = getActiveItem();
  const moreIsActive = moreItems.some((m) => m.id === activeId);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row transition-colors duration-300">

      {/* Mobile Header — brand + theme only (hamburger removed in favor of bottom nav, #9) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface border-b border-border sticky top-0 z-[110]">
        <span className="text-sm font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
          MF ADM
        </span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-border bg-background text-text-primary hover:text-accent cursor-pointer transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </header>

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-[120] w-64 bg-surface border-r border-border flex-col justify-between p-6 md:sticky md:top-0 md:h-screen">
        {/* Top brand header */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-base font-luxury font-bold tracking-tight">Mohammed Fayaz</h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeId === item.id;
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.route}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-text-primary text-background shadow-md shadow-text-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-background"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-background" : "text-text-secondary"} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="pt-6 border-t border-border space-y-3">
          <a
            href="#about"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-accent hover:bg-background transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Public Site</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer text-left"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Board Content Frame */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* Desktop Admin Header Bar — Sign Out removed (lives once, in the sidebar), #10 */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-[90]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block mb-1">
              Enterprise Control
            </span>
            <h1 className="text-lg font-luxury font-bold uppercase tracking-wide">
              {activeId === "entries" ? "Portfolio Manager" : `${activeId} panel`}
            </h1>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 border border-border bg-surface hover:border-accent/40 text-text-primary hover:text-accent rounded-xl cursor-pointer transition-all duration-300 outline-none flex items-center gap-1.5"
            title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? (
              <>
                <Moon size={13} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Dark</span>
              </>
            ) : (
              <>
                <Sun size={13} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Light</span>
              </>
            )}
          </button>
        </header>

        {/* Content Box — extra bottom padding on mobile so the fixed bottom bar never overlaps */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 pb-28 md:pb-10">
          {children}
        </div>
      </main>

      {/* #9 — Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-surface/95 backdrop-blur-md border-t border-border flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {primaryItems.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.route}
              onClick={() => setMoreOpen(false)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}
            >
              <Icon size={18} />
              <span className="truncate max-w-full">{item.id === "entries" ? "Nodes" : item.label}</span>
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
            moreOpen || moreIsActive ? "text-accent" : "text-text-secondary"
          }`}
        >
          <MoreHorizontal size={18} />
          <span>More</span>
        </button>
      </nav>

      {/* #9 — "More" bottom sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[130]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">More</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const isActive = activeId === item.id;
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.route}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-text-primary text-background"
                        : "text-text-secondary hover:text-text-primary bg-background"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-background" : "text-text-secondary"} />
                    <span className="truncate">{item.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
              <a
                href="#about"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-accent bg-background transition-all"
              >
                <ArrowLeft size={14} />
                <span>Public Site</span>
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 bg-background transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
