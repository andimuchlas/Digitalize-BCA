"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between w-full p-4 rounded-lg border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.variant === "destructive"
                ? "bg-red-50 text-red-900 border-red-200"
                : t.variant === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-white text-slate-900 border-slate-200"
            }`}
          >
            <div className="grid gap-1">
              <span className="text-sm font-semibold">{t.title}</span>
              {t.description && (
                <span className="text-xs opacity-90">{t.description}</span>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-900 transition text-xs font-semibold ml-4"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
