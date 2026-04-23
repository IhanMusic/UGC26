"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/components/ui/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200/50 bg-emerald-50/90 text-emerald-800",
  error: "border-red-200/50 bg-red-50/90 text-red-800",
  warning: "border-amber-200/50 bg-amber-50/90 text-amber-800",
  info: "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]",
};

const icons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-xl animate-fade-in-up",
              variantStyles[t.variant]
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-xs font-bold">
              {icons[t.variant]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
