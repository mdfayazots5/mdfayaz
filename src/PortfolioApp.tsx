import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorFallback } from "./components/ErrorFallback";
import { ScrollToTop } from "./components/ScrollToTop";
import { Portfolio5 } from "./components/Portfolio5";
import { ThemeProvider } from "./components/ThemeProvider";

// Admin Section Imports
import { isAuthenticated } from "./services/api";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboardPage } from "./components/admin/AdminDashboardPage";
import { AdminEntriesPage } from "./components/admin/AdminEntriesPage";
import { EntryForm } from "./components/admin/EntryForm";
import { AdminFaqPage } from "./components/admin/AdminFaqPage";
import { AdminUsesPage } from "./components/admin/AdminUsesPage";
import { AdminPrivacyPage } from "./components/admin/AdminPrivacyPage";
import { AdminAboutPage } from "./components/admin/AdminAboutPage";
import { AdminSettingsPage } from "./components/admin/AdminSettingsPage";
import { AdminServicesPage } from "./components/admin/AdminServicesPage";
import { AdminCompaniesPage } from "./components/admin/AdminCompaniesPage";
import { AdminMediaPage } from "./components/admin/AdminMediaPage";

const AdminPlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-surface p-12 rounded-3xl border border-border text-center space-y-4 animate-fade-in text-left max-w-xl mx-auto my-12">
    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent mx-auto text-lg">
      ✨
    </div>
    <div className="space-y-2 text-center">
      <h3 className="text-lg font-luxury font-bold uppercase tracking-wider text-text-primary">
        Coming in Phase 3b
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
        The administrative workspace for <span className="font-bold text-accent">{title}</span> settings is scheduled for implementation in Phase 3b. All design tokens and session states are fully configured.
      </p>
      <div className="pt-4">
        <a 
          href="#admin" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  </div>
);

function AdminRouteWrapper({ children, activeSub }: { children: React.ReactNode; activeSub: string }) {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.hash = "#admin/login";
    }
  }, [activeSub]);

  if (!isAuthenticated()) {
    return <LoadingScreen />;
  }

  return <AdminLayout activeSub={activeSub}>{children}</AdminLayout>;
}

function PortfolioRouter() {
  const [hash, setHash] = useState(() => window.location.hash);
  const { data, loading, error } = usePortfolioData(5);
  const lenis = useLenis();

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Scroll back to top on any hash routing transitions (via Lenis so it doesn't fight the
  // smooth-scroll target; falls back to native when Lenis isn't ready yet).
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [hash, lenis]);

  const normalized = hash.toLowerCase();

  // If already authenticated and user visits #admin/login, redirect to #admin.
  if (normalized === "#admin/login" && isAuthenticated()) {
    setTimeout(() => {
      window.location.hash = "#admin";
    }, 0);
    return <LoadingScreen />;
  }

  if (normalized === "#admin/login") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="admin-login"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <AdminLoginPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Intercept other administration panel views
  if (normalized.startsWith("#admin")) {
    if (!isAuthenticated()) {
      setTimeout(() => {
        window.location.hash = "#admin/login";
      }, 0);
      return <LoadingScreen />;
    }

    let activeSub = "dashboard";
    let componentToRender = <AdminDashboardPage />;

    if (normalized === "#admin" || normalized === "#admin/") {
      activeSub = "dashboard";
      componentToRender = <AdminDashboardPage />;
    } else if (normalized === "#admin/entries") {
      activeSub = "entries";
      componentToRender = <AdminEntriesPage />;
    } else if (normalized === "#admin/entries/new") {
      activeSub = "entries";
      componentToRender = <EntryForm />;
    } else if (normalized === "#admin/faq") {
      activeSub = "faq";
      componentToRender = <AdminFaqPage />;
    } else if (normalized === "#admin/services") {
      activeSub = "services";
      componentToRender = <AdminServicesPage />;
    } else if (normalized === "#admin/companies") {
      activeSub = "companies";
      componentToRender = <AdminCompaniesPage />;
    } else if (normalized === "#admin/uses") {
      activeSub = "uses";
      componentToRender = <AdminUsesPage />;
    } else if (normalized === "#admin/privacy") {
      activeSub = "privacy";
      componentToRender = <AdminPrivacyPage />;
    } else if (normalized === "#admin/about") {
      activeSub = "about";
      componentToRender = <AdminAboutPage />;
    } else if (normalized === "#admin/settings") {
      activeSub = "settings";
      componentToRender = <AdminSettingsPage />;
    } else if (normalized === "#admin/media") {
      activeSub = "media";
      componentToRender = <AdminMediaPage />;
    } else {
      // Match query for edit ID parameter
      const editMatch = hash.match(/^#admin\/entries\/([^/]+)\/edit$/i);
      if (editMatch) {
        activeSub = "entries";
        componentToRender = <EntryForm entryId={editMatch[1]} />;
      } else {
        const placeholders: string[] = [];
        let matchedPlaceholder = false;
        for (const p of placeholders) {
          if (normalized === `#admin/${p}`) {
            activeSub = `placeholder-${p}`;
            componentToRender = <AdminPlaceholderPage title={p.toUpperCase()} />;
            matchedPlaceholder = true;
            break;
          }
        }
        
        if (!matchedPlaceholder) {
          // Default fallback
          activeSub = "dashboard";
          componentToRender = <AdminDashboardPage />;
        }
      }
    }

    // NOTE: a stable key (not `hash`) keeps the AdminLayout shell — sidebar, header, nav —
    // mounted across sub-route changes. Previously `key={hash}` remounted the entire shell on
    // every sidebar click, which flashed a full-screen loader and felt like a page refresh (#8).
    // Only the inner page content swaps now.
    return (
      <AdminRouteWrapper activeSub={activeSub}>
        <AnimatePresence mode="wait">
          <motion.div
            key={hash}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {componentToRender}
          </motion.div>
        </AnimatePresence>
      </AdminRouteWrapper>
    );
  }

  // Otherwise, render Public Client Portfolio Router
  if (loading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <ErrorFallback 
        message={error || "Could not load portfolio data"} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key="portfolio5"
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Portfolio5 data={data} />
        </motion.div>
      </AnimatePresence>
      <ScrollToTop />
    </>
  );
}

export default function PortfolioApp() {
  // #2 — Lenis smooth momentum scroll. Reduced-motion users get instant scrolling.
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: !prefersReducedMotion,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <ThemeProvider>
        <PortfolioRouter />
      </ThemeProvider>
    </ReactLenis>
  );
}
