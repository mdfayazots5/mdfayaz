import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wrench, ChevronUp, ChevronDown, ArrowUpRight } from "lucide-react";
import { UsesCategory } from "../models/portfolio.model";
import { getUsesCategories } from "../services/api";
import { SectionLoader, SectionError } from "./SectionState";

export const UsesPage: React.FC = () => {
  const [categories, setCategories] = useState<UsesCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getUsesCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data || []);
          const initialOpen: Record<string, boolean> = {};
          (data || []).forEach((cat) => {
            initialOpen[cat.id] = true;
          });
          setOpenSections(initialOpen);
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

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allCollapsed = Object.values(openSections).every((v) => !v);

  const toggleAll = () => {
    const targetState = allCollapsed;
    const updated: Record<string, boolean> = {};
    categories.forEach((cat) => {
      updated[cat.id] = targetState;
    });
    setOpenSections(updated);
  };

  if (loading) {
    return <SectionLoader label="Loading setup & gear..." minHeight="70vh" />;
  }

  if (error) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;
  }

  return (
    <div id="uses-page-root" className="bg-background min-h-screen pt-36 pb-24 text-left select-none text-text-primary">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        
        {/* Breadcrumb Setup Icon */}
        <div className="flex items-center gap-2 text-text-secondary font-mono text-[10px] font-bold uppercase tracking-widest">
          <Wrench size={11} className="text-accent" />
          <span>My Setup</span>
        </div>

        {/* Header Title Section */}
        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-text-primary">
              Uses
            </h1>
            <p className="text-sm md:text-base text-text-secondary font-medium mt-3 leading-relaxed">
              The tools, gear, and software I reach for every day.
            </p>
          </div>

          {/* Collapse/Expand Toggle controller */}
          <button
            onClick={toggleAll}
            className="text-[10px] font-bold tracking-[0.2em] text-text-secondary hover:text-accent transition-colors uppercase cursor-pointer py-1 block self-start md:self-end"
          >
            {allCollapsed ? "EXPAND ALL" : "COLLAPSE ALL"}
          </button>
        </div>

        {/* Content categories list */}
        {categories.length === 0 ? (
          <div className="mt-10 p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-sm mx-auto space-y-4">
            <Wrench className="w-8 h-8 text-text-secondary/50 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Nothing here yet</h3>
            <p className="text-xs text-text-secondary leading-relaxed">No setup categories have been published yet. Check back soon.</p>
          </div>
        ) : (
        <div className="divide-y divide-border">
          {categories.map((category) => {
            const isOpen = !!openSections[category.id];
            return (
              <div key={category.id} className="py-8 first:pt-4" id={`uses-section-${category.id}`}>
                {/* Category Header Bar */}
                <button
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
                >
                  <div className="space-y-0.5">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary group-hover:text-accent transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-[11px] font-medium text-text-secondary uppercase tracking-widest">
                      {category.subtitle}
                    </p>
                  </div>
                  <div className="text-text-secondary group-hover:text-accent transition-colors p-1.5 rounded-full hover:bg-surface">
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {/* Animated accordion block items list */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 pt-6 pl-1 pr-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {category.items.map((item, index) => (
                          <div 
                            key={index} 
                            className="group/item flex justify-between items-start p-4 hover:bg-surface/80 rounded-2xl transition-all duration-350 border border-transparent hover:border-border"
                          >
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-text-primary group-hover/item:text-accent transition-colors">
                                  {item.name}
                                </span>
                                {item.tag && (
                                  <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-md text-accent bg-accent/10 border border-accent/20 uppercase tracking-wider scale-[0.9] origin-left">
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary font-medium leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            
                            {/* Visual links arrow indicator on hover */}
                            <div className="text-text-secondary opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 p-1">
                              <ArrowUpRight size={13} className="text-accent" />
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

        {/* Footer Credit Tag inspired by uses.tech */}
        <div className="mt-16 text-center border-t border-border pt-10 select-none">
          <p className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">
            Inspired by{" "}
            <a
              href="https://uses.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              uses.tech
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};
