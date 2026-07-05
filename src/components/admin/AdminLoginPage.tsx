import React, { useState } from "react";
import { Shield, Key, User, ArrowLeft, Sun, Moon } from "lucide-react";
import { login, isAuthenticated } from "../../services/api";
import { useTheme } from "../ThemeProvider";

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        window.location.hash = "#admin";
      } else {
        setError("Invalid administrative credentials.");
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPublic = () => {
    window.location.hash = "#about";
  };

  return (
    <div 
      id="admin-login-root" 
      className="min-h-screen flex items-center justify-center bg-background text-text-primary px-6 transition-colors duration-300"
    >
      {/* Top Floating Controls */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
        <button
          type="button"
          onClick={handleBackToPublic}
          className="inline-flex items-center gap-2 group text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Exit to Public</span>
        </button>

        {/* Custom High-Contrast Admin Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border hover:border-accent/40 bg-surface text-text-primary hover:text-accent cursor-pointer transition-all duration-300 outline-none flex items-center gap-1.5"
          title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        >
          {theme === "light" ? (
            <>
              <Moon size={13} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Dark</span>
            </>
          ) : (
            <>
              <Sun size={13} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Light</span>
            </>
          )}
        </button>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-surface p-6 sm:p-10 md:p-12 rounded-[2.5rem] border border-border shadow-2xl shadow-text-secondary/5 space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-luxury font-bold tracking-tight">Admin Gateway</h1>
            <p className="text-xs text-text-secondary font-medium tracking-wide mt-1">
              Provide credential parameters to enter management panel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div id="login-error-msg" className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold tracking-wide text-center">
              {error}
            </div>
          )}

          {/* Username Parameter Source */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
              Username ID
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <User size={16} />
              </span>
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Manager alias"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-accent hover:border-text-secondary/40 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Security String */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
              Password String
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Key size={16} />
              </span>
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="🔒🔑"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-accent hover:border-text-secondary/40 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="w-full py-4 mt-2 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Verifying Keys..." : "Authorize Access"}
          </button>
        </form>
      </div>
    </div>
  );
};
