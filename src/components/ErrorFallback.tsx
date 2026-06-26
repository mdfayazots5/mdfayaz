import React from "react";

interface ErrorFallbackProps {
  message: string;
  onRetry: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Connection Failed</h2>
      <p className="text-text-secondary max-w-md mb-8">{message}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onRetry}
          className="px-8 py-3 bg-accent text-accent-foreground font-bold rounded hover:bg-accent-hover transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
