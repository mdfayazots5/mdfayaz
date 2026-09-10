import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="p-1 px-2.5 rounded-full border border-current/25 hover:border-current/50 cursor-pointer transition-all duration-300 outline-none flex items-center justify-center hover:bg-current/10"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-label="Toggle theme"
    >
      {/* Colors inherit from the header via currentColor: white on the blend-mode hero,
          text-primary on the solid scrolled header and in the light dropdown. */}
      <span className="flex items-center gap-1.5">
        {theme === "light" ? (
          <>
            <Moon size={11} className="text-current" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-current">Dark</span>
          </>
        ) : (
          <>
            <Sun size={11} className="text-current" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-current">Light</span>
          </>
        )}
      </span>
    </button>
  );
};
