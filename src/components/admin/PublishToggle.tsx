import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PublishToggleProps {
  /** Resolved published state (treat an absent flag as published). */
  published: boolean;
  onToggle: () => void;
  busy?: boolean;
  /** Compact variant hides the text label (icon only). */
  compact?: boolean;
}

/**
 * Uniform publish / unpublish control shown next to the delete action across every
 * admin registry. "Live" = visible on the public portal; "Draft" = hidden. New items
 * default to published (absent flag), so toggling to Draft is an explicit choice.
 */
export const PublishToggle: React.FC<PublishToggleProps> = ({ published, onToggle, busy, compact }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    disabled={busy}
    aria-pressed={published}
    title={
      published
        ? "Published — visible on the portal. Click to unpublish (hide)."
        : "Draft — hidden from the portal. Click to publish."
    }
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 ${
      published
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
        : "border-border bg-background text-text-secondary hover:text-text-primary hover:border-accent/40"
    }`}
  >
    {published ? <Eye size={12} /> : <EyeOff size={12} />}
    {!compact && <span>{published ? "Live" : "Draft"}</span>}
  </button>
);
