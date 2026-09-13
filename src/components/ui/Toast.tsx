"use client";

import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

const ToastCtx = createContext<{ toast: (t: Omit<Toast, "id">) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3800);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6 sm:items-end sm:px-6" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-[var(--shadow-pop)] animate-fade-up",
              t.kind === "success" && "border-success-100",
              t.kind === "error" && "border-danger-100",
              t.kind === "info" && "border-brand-100",
            )}
            role="status"
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />}
            {t.kind === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" />}
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-ink-muted">{t.description}</p>}
            </div>
            <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} className="rounded-md p-1 text-ink-subtle hover:bg-canvas hover:text-ink" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
