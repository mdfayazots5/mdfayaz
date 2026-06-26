import React from "react";
import * as Icons from "lucide-react";
import { Entry } from "../models/portfolio.model";

interface ProductCardProps {
  product: Entry;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Safe dynamic lucide-react icon rendering
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-accent" />;
    }
    // Fallback if not found
    return <Icons.HelpCircle className="w-8 h-8 text-accent" />;
  };

  const statusColors: Record<string, string> = {
    "Live": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "In Development": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Private Beta": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "Completed": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const status = product.status || "Completed";
  const currentStatusColor = statusColors[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const displayTitle = product.title;
  const coverImage = product.coverImage;
  const liveUrl = product.liveUrl;

  return (
    <div
      id={`product-card-${product.id}`}
      className="flex flex-col h-full bg-surface border border-border rounded-3xl overflow-hidden hover:border-accent/60 hover:shadow-lg transition-all duration-300 text-left"
    >
      {/* Visual Preview / Icon Placeholder Area */}
      <div className="relative w-full h-48 bg-background flex items-center justify-center overflow-hidden border-b border-border">
        {coverImage ? (
          <img
            src={coverImage}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/5 via-transparent to-accent/5 p-6">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm flex items-center justify-center transition-transform duration-300 hover:scale-110">
              {renderIcon(product.icon || "Package")}
            </div>
            {/* Soft decorative ambient glow */}
            <div className="absolute w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none" />
          </div>
        )}

        {/* Floating status badge in the top-right corner of preview area */}
        <div className="absolute top-4 right-4">
          <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-xl shadow-sm ${currentStatusColor}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 p-6 md:p-8 flex flex-col space-y-5">
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-background text-text-secondary uppercase tracking-wider rounded-lg border border-border">
            {product.categoryTag}
          </span>
          {product.tech.map((t, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] font-mono text-text-secondary/80 bg-background/50 rounded-lg border border-border/70"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            {displayTitle}
          </h3>
          <p className="text-xs md:text-sm text-accent/95 font-medium tracking-wide">
            {product.tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed font-normal flex-1">
          {product.description}
        </p>

        {/* Key Features (exactly 3 bullet points) */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Key Features
            </h4>
            <ul className="space-y-1.5">
              {product.features.slice(0, 3).map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Icons.Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-xs text-text-secondary leading-normal font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-border/40 bg-background/20 flex items-center justify-between gap-4">
        {/* Audience metadata */}
        <div className="flex items-center gap-1.5 text-text-secondary max-w-[70%]">
          <Icons.Users size={12} className="text-text-secondary/70 shrink-0" />
          <span className="text-[11px] font-medium leading-tight truncate" title={product.audience}>
            {product.audience}
          </span>
        </div>

        {/* External URL detail link */}
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-mono font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest shrink-0"
          >
            <span>Details</span>
            <Icons.ExternalLink size={11} />
          </a>
        ) : null}
      </div>
    </div>
  );
};
