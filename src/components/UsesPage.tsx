import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { UsesCategory } from "../models/portfolio.model";
import { getUsesCategories } from "../services/api";
import { SectionError, SectionLoader } from "./SectionState";

export const UsesPage: React.FC = () => {
  const [categories, setCategories] = useState<UsesCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getUsesCategories()
      .then((data) => {
        if (isMounted) {
          const visible = (data || []).filter((cat) => cat.published !== false);
          setCategories(visible);
          setOpenId(visible[0]?.id || null);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  if (loading) return <SectionLoader label="Loading setup & gear..." minHeight="70vh" />;
  if (error) return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div id="uses-page-root" className="bg-background min-h-screen pt-32 md:pt-36 pb-24 text-left select-none text-text-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 text-text-secondary font-mono text-[10px] font-bold uppercase tracking-widest">
          <Wrench size={11} className="text-accent" />
          <span>Daily Setup</span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 md:pb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-luxury font-bold tracking-tight text-text-primary">
              Daily Stack
            </h1>
            <p className="text-sm md:text-base text-text-secondary font-medium mt-3 leading-relaxed">
              Hover a category on desktop to preview its tools. Tap a category on mobile to open it.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="px-3 py-1 rounded-lg border border-border bg-surface text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                {categories.length} categories
              </span>
              <span className="px-3 py-1 rounded-lg border border-border bg-surface text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                {totalItems} tools
              </span>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="mt-10 p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-sm mx-auto space-y-4">
            <Wrench className="w-8 h-8 text-text-secondary/50 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Nothing here yet</h3>
            <p className="text-xs text-text-secondary leading-relaxed">No setup categories have been published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {categories.map((category) => {
              const isOpen = openId === category.id;
              return (
                <div
                  key={category.id}
                  id={`uses-section-${category.id}`}
                  onMouseEnter={() => setOpenId(category.id)}
                  onFocus={() => setOpenId(category.id)}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? "bg-surface border-accent/35 shadow-sm" : "bg-surface/70 border-border hover:border-text-secondary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : category.id)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none px-4 md:px-5 py-4"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary group-hover:text-accent transition-colors">
                          {category.name}
                        </h2>
                        <span className="text-[9px] font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {category.items.length} items
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-text-secondary uppercase tracking-widest">
                        {category.subtitle}
                      </p>
                    </div>
                    <div className="text-text-secondary group-hover:text-accent transition-colors p-1.5 rounded-full hover:bg-surface">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 md:px-4 pb-4">
                          {category.items.map((item) => (
                            <div key={item.id || item.name} className="flex items-start gap-3 p-3 bg-background/45 rounded-xl border border-border/60">
                              <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
                              <div className="space-y-1.5 text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-text-primary">{item.name}</span>
                                  {item.tag && (
                                    <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-md text-accent bg-accent/10 border border-accent/20 uppercase tracking-wider">
                                      {item.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center border-t border-border pt-10 select-none">
          <p className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">
            Inspired by{" "}
            <a href="https://uses.tech" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              uses.tech
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
