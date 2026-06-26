import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="p-1 px-2.5 rounded-full border border-white/20 hover:border-white/40 cursor-pointer transition-all duration-300 outline-none flex items-center justify-center bg-white/5 hover:bg-white/15"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-label="Toggle theme"
    >
      <span className="flex items-center gap-1.5">
        {theme === "light" ? (
          <>
            <Moon size={11} className="text-white" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-white">Dark</span>
          </>
        ) : (
          <>
            <Sun size={11} className="text-white" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-white">Light</span>
          </>
        )}
      </span>
    </button>
  );
};
