"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Variant = "success" | "danger" | "info";
type ToastMsg = { id: number; text: string; variant: Variant };

const ToastContext = createContext<(text: string, variant?: Variant) => void>(
  () => {}
);

export function useToast() {
  return useContext(ToastContext);
}

const ICON: Record<Variant, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" aria-hidden />,
  danger: <AlertTriangle className="h-4 w-4 shrink-0 text-coral" aria-hidden />,
  info: <Info className="h-4 w-4 shrink-0 text-lavender" aria-hidden />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const toast = useCallback((text: string, variant: Variant = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Mobile: atas-tengah. Desktop: kanan-bawah. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex animate-rise items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ivory shadow-lg shadow-black/30"
          >
            {ICON[t.variant]}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
