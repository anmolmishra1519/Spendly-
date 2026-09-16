import type { ReactNode } from 'react';
import { AlertTriangle } from './icons';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  danger = true,
  onCancel,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-4 animate-fade-in" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-card bg-surface dark:bg-surface-dark p-6 shadow-soft animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 id="confirm-title" className="text-base font-semibold text-ink dark:text-ink-dark">
          {title}
        </h3>
        {description && <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-control border border-border dark:border-border-dark px-4 py-2.5 text-sm font-medium text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-control px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              danger ? 'bg-danger hover:bg-danger/90' : 'bg-brand hover:bg-brand/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
