import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  User,
  HelpCircle,
  Wrench,
  Shield,
  Settings,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  Building2,
  Image as ImageIcon,
} from "lucide-react";
import { logout } from "../../services/api";
import { useTheme } from "../ThemeProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSub: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSub }) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    // Sign-out returns to the public portfolio home, not the login gate.
    window.location.hash = "#home";
  };

  const menuItems = [
    { label: "Dashboard", id: "dashboard", icon: LayoutDashboard, route: "#admin" },
    { label: "Portfolio Nodes", id: "entries", icon: Briefcase, route: "#admin/entries" },
    { label: "Companies", id: "companies", icon: Building2, route: "#admin/companies" },
    { label: "About", id: "about", icon: User, route: "#admin/about" },
    { label: "FAQ", id: "faq", icon: HelpCircle, route: "#admin/faq" },
    { label: "Services", id: "services", icon: Sparkles, route: "#admin/services" },
    { label: "Uses", id: "uses", icon: Wrench, route: "#admin/uses" },
    { label: "Privacy", id: "privacy", icon: Shield, route: "#admin/privacy" },
    { label: "Media", id: "media", icon: ImageIcon, route: "#admin/media" },
    { label: "Settings", id: "settings", icon: Settings, route: "#admin/settings" },
  ];

  // Mobile bottom tab bar: keep it to daily-use editing workspaces.
  const primaryIds = ["dashboard", "entries", "services", "media"];
  const primaryItems = primaryIds.map((id) => menuItems.find((m) => m.id === id)!);

  const getActiveItem = () => {
    if (activeSub === "dashboard") return "dashboard";
    if (activeSub.startsWith("entry") || activeSub.startsWith("projects") || activeSub.startsWith("products")) return "entries";
    if (activeSub.startsWith("placeholder-")) {
      return activeSub.replace("placeholder-", "");
    }
    return activeSub;
  };

  const activeId = getActiveItem();
  const activePageTitle =
    menuItems.find((item) => item.id === activeId)?.label ||
    (activeId === "dashboard" ? "Dashboard" : "Admin Panel");

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row transition-colors duration-300">

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border sticky top-0 z-[110]">
        <a
          href="#admin"
          className="text-lg font-luxury font-bold tracking-tighter text-text-primary hover:text-accent transition-colors"
          aria-label="Go to admin dashboard"
        >
          Fayaz
        </a>
        <div className="flex items-center gap-2">
          <a
            href="#home"
            className="p-2 rounded-lg border border-border bg-background text-text-secondary hover:text-accent cursor-pointer transition-all duration-300"
            aria-label="Open public site"
            title="Public site"
          >
            <ArrowLeft size={15} />
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-background text-text-primary hover:text-accent cursor-pointer transition-all duration-300"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition-all duration-300"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-[120] w-64 bg-surface border-r border-border flex-col justify-between p-6 md:sticky md:top-0 md:h-screen">
        {/* Top brand header */}
        <div className="space-y-8">
          <a href="#admin" className="flex items-center gap-2.5 group" aria-label="Go to admin dashboard">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-lg font-luxury font-bold tracking-tighter group-hover:text-accent transition-colors">Fayaz</h2>
          </a>

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
                  <Icon size={14} strokeWidth={2} className={isActive ? "text-background" : "text-text-secondary"} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="pt-6 border-t border-border space-y-3">
          <a
            href="#home"
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
              {activeId === "entries" ? "Portfolio Manager" : activePageTitle}
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
        <div className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6 md:space-y-8 pb-24 md:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-surface/95 backdrop-blur-md border-t border-border flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {primaryItems.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.route}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="truncate max-w-full">{item.id === "entries" ? "Nodes" : item.label}</span>
            </a>
          );
        })}
      </nav>

    </div>
  );
};
