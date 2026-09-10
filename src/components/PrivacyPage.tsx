import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronDown, Shield } from "lucide-react";
import { PrivacySection } from "../models/portfolio.model";
import { getPrivacySections } from "../services/api";
import { SectionError, SectionLoader } from "./SectionState";

interface PrivacyPageProps {
  onBack?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canHoverPreview = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getPrivacySections()
      .then((data) => {
        if (isMounted) {
          const visible = (data || []).filter((section) => section.published !== false);
          setSections(visible);
          setExpandedId(visible[0]?.id || null);
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

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) onBack();
    else window.location.hash = "#home";
  };

  if (loading) return <SectionLoader label="Loading policy..." minHeight="70vh" />;
  if (error) return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;

  return (
    <div id="privacy-page-root" className="bg-background min-h-screen pt-36 pb-24 text-left select-none text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full border border-accent/20">
              <Shield size={14} className="text-accent shrink-0" />
              <span className="text-xs font-semibold tracking-wide">Privacy Policy</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-luxury font-bold text-text-primary tracking-tight leading-tight">
              Your privacy matters to us.
            </h1>

            <p className="text-base text-text-secondary font-medium leading-relaxed">
              Hover a policy record on desktop to preview its details. Tap a record on mobile to open it.
            </p>

            <div className="text-xs font-medium text-text-secondary">
              Last updated: February 14, 2026
            </div>

            <div className="pt-4">
              <a
                href="#"
                onClick={handleBack}
                className="inline-flex items-center gap-2 group text-sm font-bold text-text-secondary hover:text-accent transition-colors duration-250 cursor-pointer"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface p-3 sm:p-6 rounded-2xl border border-border shadow-xl shadow-text-secondary/5 space-y-3">
              {sections.length === 0 && (
                <p className="text-sm text-text-secondary font-medium italic leading-relaxed">
                  The privacy policy has not been published yet. Please check back soon.
                </p>
              )}

              {sections.map((section) => {
                const isOpen = expandedId === section.id;
                return (
                  <div
                    key={section.id}
                    id={section.id}
                    onMouseEnter={() => {
                      if (canHoverPreview()) setExpandedId(section.id);
                    }}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isOpen ? "border-accent/40 bg-background/30" : "border-border bg-surface hover:border-text-secondary/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId((current) => (current === section.id ? null : section.id))}
                      className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <h3 className="text-base sm:text-lg font-luxury font-bold text-text-primary leading-tight">
                        {section.title}
                      </h3>
                      <ChevronDown
                        size={15}
                        className={`text-text-secondary transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-accent" : ""}`}
                      />
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
                          <div className="px-4 sm:px-5 pb-5 pt-1 space-y-2 border-t border-border">
                            {section.body.split("\n\n").map((para, idx) => (
                              <p key={idx} className="text-sm text-text-secondary font-medium leading-relaxed">
                                {para}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
