import React, { useState, useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { PrivacySection } from "../models/portfolio.model";
import { getPrivacySections } from "../services/api";
import { LoadingScreen } from "./LoadingScreen";

interface PrivacyPageProps {
  onBack?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPrivacySections().then((data) => {
      if (isMounted) {
        setSections(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) {
      onBack();
    } else {
      window.location.hash = "#about";
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="privacy-page-root" className="bg-background min-h-screen pt-36 pb-24 text-left select-none text-text-primary">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
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
            <div className="bg-surface p-8 sm:p-12 rounded-[2rem] border border-border shadow-xl shadow-text-secondary/5 space-y-10">
              
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-3" id={sec.id}>
                  <h3 className="text-lg font-luxury font-bold text-text-primary">
                    {sec.title}
                  </h3>
                  <div className="space-y-2">
                    {sec.body.split("\n\n").map((para, idx) => (
                      <p key={idx} className="text-sm text-text-secondary font-medium leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
