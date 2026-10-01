import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import styles from './Toast.module.css';

interface ToastValue {
  announce: (message: string, options?: { visual?: boolean }) => void;
}

const ToastContext = createContext<ToastValue>({ announce: () => {} });

// One polite live region for bag and points updates (SPEC.md 5.10), plus the visual toast.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState('');
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  const announce = useCallback((message: string, options?: { visual?: boolean }) => {
    setLive('');
    // Clearing first makes screen readers repeat identical messages.
    window.setTimeout(() => setLive(message), 50);
    if (options?.visual !== false) setToast({ message, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {live}
      </div>
      {toast && (
        <div key={toast.key} className={styles.toast} aria-hidden="true">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnnounce() {
  return useContext(ToastContext).announce;
}
