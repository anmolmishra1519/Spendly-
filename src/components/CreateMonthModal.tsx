import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { currentMonthYear, MONTH_NAMES } from '@/utils/dates';
import { parseAmountInput } from '@/utils/currency';
import { X } from './icons';

export function CreateMonthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMonth = useAppStore((s) => s.createMonth);
  const { month: defaultMonth, year: defaultYear } = currentMonthYear();
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;
  const years = [defaultYear - 1, defaultYear, defaultYear + 1];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = parseAmountInput(budget);
    if (!amount || amount <= 0) {
      setError('Enter a monthly budget greater than ₹0.');
      return;
    }
    setSubmitting(true);
    try {
      await createMonth(month, year, amount);
      setBudget('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/40 px-4 animate-fade-in" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-card bg-surface dark:bg-surface-dark p-6 shadow-soft animate-scale-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink dark:text-ink-dark">Create a new month</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-bg dark:hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">Select Month</label>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-control border border-border dark:border-border-dark bg-transparent px-3 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-control border border-border dark:border-border-dark bg-transparent px-3 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">Monthly Budget</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="Enter amount"
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-control bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            Start Tracking
          </button>
        </div>
      </form>
    </div>
  );
}
