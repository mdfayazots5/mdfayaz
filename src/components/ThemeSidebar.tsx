import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sun, Moon, X, Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ThemeSetPicker } from "./ThemeSetPicker";

interface ThemeSidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in "Appearance" panel — the single home for both brightness (Light/Dark)
 * and palette personality (Theme Set). Consolidates controls that were previously
 * scattered across the header so the nav stays uncluttered.
 */
export const ThemeSidebar: React.FC<ThemeSidebarProps> = ({ open, onClose }) => {
  const { theme, toggleTheme, themeSet, setThemeSet } = useTheme();

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const modes: { id: "light" | "dark"; label: string; Icon: typeof Sun }[] = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-label="Appearance settings"
            aria-modal="true"
            className="fixed right-0 top-0 z-[200] h-full w-[86%] max-w-sm bg-surface border-l border-border shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                  <Palette size={15} />
                </span>
                <div className="space-y-0.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-primary leading-none">
                    Appearance
                  </h2>
                  <p className="text-[10px] text-text-secondary leading-none">Theme &amp; brightness</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close appearance panel"
                className="p-1.5 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              {/* Mode */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-primary mb-1">Mode</h3>
                <p className="text-[10px] text-text-secondary mb-3">Controls overall brightness</p>
                <div className="grid grid-cols-2 gap-3">
                  {modes.map(({ id, label, Icon }) => {
                    const active = theme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          if (theme !== id) toggleTheme();
                        }}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 transition-colors cursor-pointer ${
                          active
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-border text-text-secondary hover:border-accent/40 hover:text-text-primary"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            active ? "border-accent/30 bg-accent/10" : "border-border bg-background"
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Set */}
              <ThemeSetPicker value={themeSet} onChange={setThemeSet} />
            </div>

            <div className="px-5 py-3 border-t border-border">
              <p className="text-[9px] text-text-secondary text-center tracking-wide">
                Your choice is saved on this device.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
