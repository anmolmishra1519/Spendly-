import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useSelectedMonth } from '@/hooks/useDerivedData';
import { parseAmountInput, formatINR } from '@/utils/currency';
import { monthLabel } from '@/utils/dates';
import { X } from './icons';

export function EditBudgetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const updateBudget = useAppStore((s) => s.updateBudget);
  const showToast = useAppStore((s) => s.showToast);
  const selectedMonth = useSelectedMonth();

  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill with current budget when modal opens
  useEffect(() => {
    if (open && selectedMonth) {
      setBudget(String(selectedMonth.budget));
      setError(null);
    }
  }, [open, selectedMonth]);

  if (!open || !selectedMonth) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = parseAmountInput(budget);
    if (!amount || amount <= 0) {
      setError('Enter a budget amount greater than ₹0.');
      return;
    }
    if (amount === selectedMonth!.budget) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      await updateBudget(amount);
      showToast('Budget updated successfully.', 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/40 px-4 animate-fade-in"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-card bg-surface dark:bg-surface-dark p-6 shadow-soft animate-scale-in"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-ink-dark">Edit Budget</h2>
            <p className="mt-0.5 text-xs text-muted dark:text-muted-dark">
              {monthLabel(selectedMonth.month, selectedMonth.year)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted hover:bg-bg dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current budget hint */}
          <p className="text-xs text-muted dark:text-muted-dark">
            Current budget:{' '}
            <span className="font-semibold text-ink dark:text-ink-dark">
              {formatINR(selectedMonth.budget)}
            </span>
          </p>

          {/* New budget input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
              New Monthly Budget
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                ₹
              </span>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="Enter new amount"
                autoFocus
                className="w-full rounded-control border border-border dark:border-border-dark bg-transparent py-2.5 pl-7 pr-3.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-control bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-control border border-border dark:border-border-dark py-3 text-sm font-semibold text-ink dark:text-ink-dark transition-colors hover:bg-bg dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-control bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
