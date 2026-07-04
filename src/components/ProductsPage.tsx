import React from "react";
import { motion } from "motion/react";
import { Activity, Code, Layers } from "lucide-react";
import { Entry } from "../models/portfolio.model";
import { getEntries } from "../services/api";
import { ProductCard } from "./ProductCard";
import { SectionLoader, SectionError } from "./SectionState";

interface ProductsPageProps {
  showOnlyGrid?: boolean;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ showOnlyGrid = false }) => {
  const [products, setProducts] = React.useState<Entry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getEntries()
      .then((data) => {
        if (isMounted) {
          // Filter to personal entries only
          const personalEntries = data.filter((item) => item.type === "personal");
          // Sort products by displayOrder ascending
          const sorted = [...personalEntries].sort((a, b) => {
            const orderA = a.displayOrder !== undefined ? a.displayOrder : a.id;
            const orderB = b.displayOrder !== undefined ? b.displayOrder : b.id;
            return orderA - orderB;
          });
          setProducts(sorted);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  if (loading) {
    return <SectionLoader label="Sourcing dynamic products..." />;
  }

  if (error) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  // Calculate stats for the stat card
  const liveCount = products.filter(p => p.status === "Live").length;
  const devCount = products.filter(p => p.status === "In Development").length;
  const betaCount = products.filter(p => p.status === "Private Beta").length;
  const completedCount = products.filter(p => p.status === "Completed").length;

  if (showOnlyGrid) {
    return (
      <div className="animate-fade-in w-full">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          {products.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-md mx-auto space-y-4">
              <Activity className="w-8 h-8 text-text-secondary/50 mx-auto" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No products available</h3>
              <p className="text-xs text-text-secondary leading-relaxed">No side projects are currently published. Launch the administrative CMS gateway to register modern apps immediately.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div id="products-section" className="bg-background min-h-screen pb-24">
      {/* Products Header Section */}
      <header className="relative py-24 lg:py-32 px-5 md:px-8 lg:px-24 bg-surface/40 border-b border-border text-center overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-[22vw] font-luxury font-black text-text-secondary/15 select-none">DESIGNS</span>
        </div>
        <div className="z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center text-left">
          {/* Main Title & Subtitle Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold text-accent uppercase tracking-[0.3em] bg-background border border-border rounded-full">
              <Code size={11} className="text-accent" />
              Side Projects
            </span>
            <h1 className="text-4xl lg:text-5xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
              Products Catalog
            </h1>
            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-xl">
              A curated showcase of original SaaS software and niche automation tools built entirely independent of agency client briefs, highlighting full product cycle execution.
            </p>
          </div>

          {/* Desktop Only Stat Card */}
          <div className="hidden lg:block bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">
                Product Statistics
              </span>
              <Layers size={13} className="text-accent" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-luxury font-bold text-text-primary">
                {products.length}
              </span>
              <span className="text-xs font-semibold text-text-secondary font-mono uppercase tracking-wider">
                Total Products
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono font-bold text-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Live: {liveCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>In Dev: {devCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Beta: {betaCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Finished: {completedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-16">
        {products.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-md mx-auto space-y-4">
            <Activity className="w-8 h-8 text-text-secondary/50 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No products available</h3>
            <p className="text-xs text-text-secondary leading-relaxed">No side projects are currently published. Launch the administrative CMS gateway to register modern apps immediately.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
