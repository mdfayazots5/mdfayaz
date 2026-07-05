import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FaqItem } from "../models/portfolio.model";
import { getFaqItems } from "../services/api";
import { SectionError, SectionLoader } from "./SectionState";

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getFaqItems()
      .then((items) => {
        if (isMounted) {
          setFaqs((items || []).filter((faq) => faq.published !== false));
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

  if (loading) return <SectionLoader label="Loading questions..." minHeight="70vh" />;
  if (error) return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;

  return (
    <div id="faq-page-container" className="pt-24 lg:pt-36 bg-background select-none text-text-primary text-left">
      <header className="px-5 md:px-8 lg:px-24 py-16 text-center border-b border-border relative overflow-hidden bg-surface/40">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-[30vw] font-luxury font-black text-text-secondary select-none">Q&A</span>
        </div>
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.5em] block">
            Common Inquiries
          </span>
          <h1 className="text-4xl lg:text-6xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
            Architect & Recruiter FAQ
          </h1>
          <p className="text-sm text-text-secondary font-medium max-w-xl mx-auto leading-relaxed">
            Hover a record on desktop to preview the answer. Tap a record on mobile to open it.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-12 lg:py-20">
        {faqs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-surface/50">
            <HelpCircle size={32} className="text-text-secondary/50 mx-auto mb-3" />
            <p className="text-xs text-text-secondary font-medium italic">No questions are published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = expandedIndex === idx;
              let iconColor = "text-sky-500 bg-sky-500/10";
              if (faq.category === "Architectural") iconColor = "text-accent bg-accent/10";
              else if (faq.category === "Consulting") iconColor = "text-sky-400 bg-sky-400/10";
              else if (faq.category === "Recruitment") iconColor = "text-emerald-500 bg-emerald-500/10";

              return (
                <div
                  key={faq.id || idx}
                  onMouseEnter={() => setExpandedIndex(idx)}
                  onFocus={() => setExpandedIndex(idx)}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden bg-surface ${
                    isOpen ? "border-accent/40 shadow-md shadow-accent/5" : "border-border hover:border-text-secondary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full px-5 md:px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-background/25 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md tracking-wider shrink-0 ${iconColor}`}>
                        {faq.category}
                      </span>
                      <h3 className="text-xs md:text-sm font-bold text-text-primary leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-text-secondary transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-accent" : "rotate-0"}`}
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
                        <div className="px-5 md:px-6 pb-6 pt-1 text-xs md:text-sm text-text-secondary font-medium leading-relaxed border-t border-border bg-background/10 md:pl-24">
                          <p className="max-w-2xl">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
