import React, { useEffect } from "react";
import * as Icons from "lucide-react";
import { Service } from "../models/portfolio.model";

interface ServiceDetailModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent scrolling behind modal
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Render icon dynamically
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-accent shrink-0" />;
    }
    return <Icons.HelpCircle className="w-8 h-8 text-accent shrink-0" />;
  };

  const statusColorClasses = service.status === "Active"
    ? "bg-accent/10 text-accent border-accent/25"
    : "bg-text-secondary/10 text-text-secondary border-border";

  return (
    <div 
      id="service-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="service-detail-modal-container"
        className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left animate-zoom-in overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary hover:bg-background/80 rounded-xl border border-transparent hover:border-border transition-all cursor-pointer"
          title="Close details"
        >
          <Icons.X size={16} />
        </button>

        {/* Header Title Section */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-background border border-border rounded-2xl shadow-sm">
            {renderIcon(service.icon)}
          </div>
          <div className="space-y-1.5 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border rounded-lg ${statusColorClasses}`}>
                {service.status}
              </span>
              <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest bg-background border border-border px-1.5 py-0.5 rounded-lg">
                Expertise
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-luxury tracking-tight leading-snug text-text-primary">
              {service.name}
            </h2>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Tagline & Detailed Description */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-accent leading-relaxed">
            {service.tagline}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Highlights bullets list */}
        {service.highlights && service.highlights.length > 0 && (
          <div className="space-y-2.5 bg-background/40 border border-border/80 rounded-2xl p-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-primary flex items-center gap-1.5">
              <Icons.Sparkles size={12} className="text-accent" />
              <span>Core Highlights</span>
            </h3>
            <ul className="space-y-2">
              {service.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                  <Icons.Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="leading-normal font-medium">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border hover:border-text-primary/30 text-text-secondary hover:text-text-primary rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Go Back
          </button>
          
          <a
            href="#contact"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer animate-pulse"
          >
            <span>Get in touch</span>
            <Icons.ChevronRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
