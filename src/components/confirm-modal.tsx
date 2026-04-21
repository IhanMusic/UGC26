"use client";

import { useState, useCallback, createContext, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: "",
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => handleClose(false)}
          />
          {/* Modal */}
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            {options.title && (
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {options.title}
              </h3>
            )}
            <p className="text-sm text-slate-600 leading-relaxed">
              {options.message}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
              >
                {options.cancelLabel || "Cancel"}
              </Button>
              <Button
                variant={options.variant === "destructive" ? "destructive" : "default"}
                size="sm"
                onClick={() => handleClose(true)}
                autoFocus
              >
                {options.confirmLabel || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
