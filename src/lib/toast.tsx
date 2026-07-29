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
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const colors = {
    error: "bg-red-600 text-white",
    success: "bg-forest-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-white",
  };

  const icons = {
    error: "❌",
    success: "✅",
    info: "ℹ️",
    warning: "⚠️",
  };

  return (
    <div
      className={`${colors[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 animate-[slideIn_0.3s_ease-out]`}
    >
      <span className="text-sm mt-0.5">{icons[toast.type]}</span>
      <p className="text-sm flex-1 break-words">{toast.message}</p>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
