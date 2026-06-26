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
  Menu, 
  X, 
  Sun, 
  Moon,
  ArrowLeft,
  Package,
  Sparkles
} from "lucide-react";
import { logout } from "../../services/api";
import { useTheme } from "../ThemeProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSub: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSub }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const getActiveItem = () => {
    if (activeSub === "dashboard") return "dashboard";
    if (activeSub.startsWith("entry") || activeSub.startsWith("projects") || activeSub.startsWith("products")) return "entries";
    if (activeSub.startsWith("placeholder-")) {
      return activeSub.replace("placeholder-", "");
    }
    return activeSub;
  };

  const activeId = getActiveItem();

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface border-b border-border sticky top-0 z-[110]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
            MF ADM
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-border bg-background text-text-primary hover:text-accent cursor-pointer transition-all duration-300"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border bg-background text-text-primary cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop and Mobile drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[120] w-64 bg-surface border-r border-border flex flex-col justify-between p-6 transition-all duration-300 md:sticky md:top-0 md:h-screen md:flex md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top brand header */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-base font-luxury font-bold tracking-tight">Mohammed Fayaz</h2>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X size={18} />
            </button>
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
                  onClick={() => setMobileMenuOpen(false)}
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
          {/* Quick exit to public portfolio */}
          <a
            href="#about"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-accent hover:bg-background transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Public Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer text-left"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay back-shadow for mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-[100] md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Board Content Frame */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* Desktop Admin Header Bar */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-[90]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block mb-1">
              Enterprise Control
            </span>
            <h1 className="text-lg font-luxury font-bold uppercase tracking-wide">
              {activeId === "entries" ? "Portfolio Manager" : `${activeId} panel`}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle widget */}
            <button
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

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
