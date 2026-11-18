import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="px-3 py-2 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-text-primary/[0.06] hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-label="Toggle theme"
    >
      {/* Rendered as the last segment of the nav's glass capsule; colour inherits text-primary. */}
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
