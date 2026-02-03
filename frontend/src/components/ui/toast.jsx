import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = Date.now();

    setToasts(t => [...t, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed top-6 right-6 z-[9999] space-y-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`w-80 rounded-xl border px-4 py-3 shadow-xl backdrop-blur
            ${t.variant === "destructive"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-white border-slate-200 text-slate-800"}`}
          >
            <p className="font-bold text-sm">{t.title}</p>
            {t.description && (
              <p className="text-xs mt-1 text-slate-500">
                {t.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
