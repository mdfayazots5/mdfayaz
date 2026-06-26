import React from "react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 border-4 border-accent/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold font-luxury text-text-primary mb-2 tracking-tight">Mohammed Fayaz</h2>
        <p className="text-text-secondary text-xs font-medium uppercase tracking-[0.2em] animate-pulse">
          Initializing Editorial Portfolio...
        </p>
      </div>
    </div>
  );
};
