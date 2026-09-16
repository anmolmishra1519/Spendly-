import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { CheckCircle2, AlertTriangle, Info } from './icons';

export function ToastHost() {
  const toast = useAppStore((s) => s.toast);
  const dismissToast = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dismissToast(), 3200);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const styles = {
    success: { bg: 'bg-ink text-white', icon: <CheckCircle2 className="h-4 w-4 text-success" /> },
    error: { bg: 'bg-ink text-white', icon: <AlertTriangle className="h-4 w-4 text-danger" /> },
    info: { bg: 'bg-ink text-white', icon: <Info className="h-4 w-4 text-brand" /> },
  }[toast.tone];

  return (
    <div className="fixed inset-x-0 bottom-20 z-[100] flex justify-center px-4 md:bottom-8" role="status" aria-live="polite">
      <div className={`flex items-center gap-2.5 rounded-control ${styles.bg} px-4 py-3 shadow-soft animate-fade-in-up`}>
        {styles.icon}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
