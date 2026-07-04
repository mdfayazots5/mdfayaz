import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface SectionLoaderProps {
  label?: string;
  minHeight?: string;
}

/**
 * Lightweight in-place loader for data-driven section pages (Uses, FAQ, Services, …).
 * The full-screen `LoadingScreen` is reserved for the initial app boot; sections use this
 * so the shell/header stays put and there is no jarring full-page flash. Minimal aesthetic:
 * thin accent ring + JetBrains Mono caption.
 */
export const SectionLoader: React.FC<SectionLoaderProps> = ({ label = "Loading…", minHeight = "40vh" }) => (
  <div className="flex items-center justify-center bg-background select-none" style={{ minHeight }}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">{label}</span>
    </div>
  </div>
);

interface SectionErrorProps {
  onRetry: () => void;
  message?: string;
  minHeight?: string;
}

/**
 * In-place error/retry state for section pages when the configured backend fails. Shown instead
 * of dummy/fallback content so a failed request is never mistaken for real (empty) data.
 */
export const SectionError: React.FC<SectionErrorProps> = ({
  onRetry,
  message = "We couldn't reach the content service. Please try again.",
  minHeight = "40vh",
}) => (
  <div
    className="flex items-center justify-center bg-background px-6 text-center"
    style={{ minHeight }}
  >
    <div className="max-w-sm space-y-5">
      <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
        <AlertTriangle size={20} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Content unavailable</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-accent-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 cursor-pointer"
      >
        <RefreshCw size={12} />
        <span>Retry</span>
      </button>
    </div>
  </div>
);
