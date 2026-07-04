import React from "react";
import { Check } from "lucide-react";
import type { ThemeSet } from "../models/portfolio.model";
import { THEME_SETS } from "../config/theme-sets";

interface ThemeSetPickerProps {
  value: ThemeSet;
  onChange: (themeSet: ThemeSet) => void;
  /** Optional heading/helper — hidden in compact contexts like the header dropdown. */
  showHeader?: boolean;
  className?: string;
}

/**
 * Reusable, controlled palette picker. Renders the shared THEME_SETS as a
 * vertical list of accessible radio options with a swatch, name, description and
 * a clear selected state. Purely presentational — the caller owns `value`/`onChange`
 * (public: local preference via ThemeProvider; admin: the R2-saved default).
 */
export const ThemeSetPicker: React.FC<ThemeSetPickerProps> = ({
  value,
  onChange,
  showHeader = true,
  className = "",
}) => {
  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-primary">Theme Set</h3>
          <p className="text-[10px] text-text-secondary">Pick a visual theme variant</p>
        </div>
      )}

      <div role="radiogroup" aria-label="Theme Set" className="flex flex-col gap-1.5">
        {THEME_SETS.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`group flex w-full items-center gap-3 rounded-btn border px-2.5 py-2 text-left transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 ${
                selected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50 hover:bg-current/5"
              }`}
            >
              {/* Swatch: bg · surface · accent · text */}
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 flex-wrap overflow-hidden rounded-md border border-border"
              >
                {option.swatch.map((color, i) => (
                  <span key={i} className="h-3 w-3" style={{ backgroundColor: color }} />
                ))}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-text-primary">
                  {option.label}
                </span>
                <span className="block truncate text-[10px] text-text-secondary">
                  {option.description}
                </span>
              </span>

              <Check
                size={14}
                className={`shrink-0 transition-opacity ${
                  selected ? "text-accent opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
