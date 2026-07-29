import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type ToastType = "error" | "success" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
});

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "error") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Escuchar eventos custom desde fuera de React (interceptores axios, etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; type: ToastType }>)
        .detail;
      if (detail?.message) {
        addToast(detail.message, detail.type);
      }
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      {/* Popup centrado en pantalla */}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col gap-3 w-96 max-w-[calc(100vw-2rem)] pointer-events-auto">
            {toasts.map((t) => (
              <ToastPopup key={t.id} toast={t} />
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastPopup({ toast }: { toast: Toast }) {
  const colors = {
    error: "border-red-400 bg-white",
    success: "border-forest-400 bg-white",
    info: "border-blue-400 bg-white",
    warning: "border-amber-400 bg-white",
  };

  const iconColors = {
    error: "bg-red-100 text-red-600",
    success: "bg-forest-100 text-forest-600",
    info: "bg-blue-100 text-blue-600",
    warning: "bg-amber-100 text-amber-600",
  };

  const icons = {
    error: "✕",
    success: "✓",
    info: "i",
    warning: "!",
  };

  return (
    <div
      className={`${colors[toast.type]} border-l-4 rounded-lg shadow-xl p-4 flex items-start gap-3 animate-[fadeIn_0.2s_ease-out]`}
    >
      <div
        className={`w-8 h-8 rounded-full ${iconColors[toast.type]} flex items-center justify-center text-sm font-bold shrink-0`}
      >
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800">Atención</p>
        <p className="text-sm text-stone-600 mt-0.5 break-words">{toast.message}</p>
      </div>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
