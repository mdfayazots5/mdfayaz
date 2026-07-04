import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronDown, Shield } from "lucide-react";
import { PrivacySection } from "../models/portfolio.model";
import { getPrivacySections } from "../services/api";
import { SectionLoader, SectionError } from "./SectionState";

interface PrivacyPageProps {
  onBack?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    getPrivacySections()
      .then((data) => {
        // Only published sections reach the portal (absent flag = published).
        if (isMounted) setSections((data || []).filter((s) => s.published !== false));
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
    if (onBack) {
      onBack();
    } else {
      window.location.hash = "#home";
    }
  };

  if (loading) {
    return <SectionLoader label="Loading policy..." minHeight="70vh" />;
  }

  if (error) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;
  }

  return (
    <div id="privacy-page-root" className="bg-background min-h-screen pt-36 pb-24 text-left select-none text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-24">
        {/* Main 2-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* Left Column - Metadata & Introduction */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
            
            {/* Breadcrumb / Category Badge with shield icon */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full border border-accent/20">
              <Shield size={14} className="text-accent shrink-0" />
              <span className="text-xs font-semibold tracking-wide">Privacy Policy</span>
            </div>

            {/* Main Page Title */}
            <h1 className="text-4xl lg:text-5xl font-luxury font-bold text-text-primary tracking-tight leading-tight">
              Your privacy matters to us.
            </h1>

            {/* Intro Lead Text */}
            <p className="text-base text-text-secondary font-medium leading-relaxed">
              We keep this policy simple. This page explains what information we collect, why we collect it, and how you can control it.
            </p>

            {/* Date Metadata */}
            <div className="text-xs font-medium text-text-secondary">
              Last updated: February 14, 2026
            </div>

            {/* Back Button Action Link */}
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

          {/* Right Column - Policy Content Card */}
          <div className="lg:col-span-7">
            <div className="bg-surface p-3 sm:p-6 rounded-2xl border border-border shadow-xl shadow-text-secondary/5 space-y-3">

              {sections.length === 0 && (
                <p className="text-sm text-text-secondary font-medium italic leading-relaxed">
                  The privacy policy has not been published yet. Please check back soon.
                </p>
              )}

              {sections.map((sec) => {
                const isOpen = expandedId === sec.id;
                return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isOpen ? "border-accent/40 bg-background/30" : "border-border bg-surface hover:border-text-secondary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : sec.id)}
                    className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <h3 className="text-base sm:text-lg font-luxury font-bold text-text-primary leading-tight">
                      {sec.title}
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
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-2 border-t border-border">
                          {sec.body.split("\n\n").map((para, idx) => (
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
