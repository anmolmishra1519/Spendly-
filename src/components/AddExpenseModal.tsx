import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { ExpenseRecord } from '@/types';
import { todayISODate } from '@/utils/dates';
import { CategoryIcon, X } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  editingExpense?: ExpenseRecord | null;
}

export function AddExpenseModal({ open, onClose, editingExpense }: Props) {
  const categories = useAppStore((s) => s.categories);
  const addExpense = useAppStore((s) => s.addExpense);
  const updateExpense = useAppStore((s) => s.updateExpense);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISODate());
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(String(editingExpense.amount));
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setNote(editingExpense.note ?? '');
    } else {
      setName('');
      setAmount('');
      setDate(todayISODate());
      setCategoryId(categories[0]?.id ?? '');
      setNote('');
    }
    setError(null);
  }, [open, editingExpense, categories]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const numericAmount = Number(amount);

    if (!trimmedName) return setError("Give this expense a name.");
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return setError('Enter an amount greater than ₹0.');
    }
    if (!date) return setError('Pick a date.');
    if (!categoryId) return setError('Choose a category.');

    setSubmitting(true);
    try {
      const input = { name: trimmedName, amount: numericAmount, date, categoryId, note: note.trim() || undefined };
      if (editingExpense) {
        await updateExpense(editingExpense.id, input);
      } else {
        await addExpense(input);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 animate-fade-in md:items-center" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92vh] w-full flex-col rounded-t-card bg-surface dark:bg-surface-dark shadow-soft animate-fade-in-up md:h-auto md:max-h-[88vh] md:w-full md:max-w-md md:rounded-card"
      >
        <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-5 py-4">
          <h2 className="text-base font-semibold text-ink dark:text-ink-dark">
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted hover:bg-bg dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="expense-name" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Expense Name
              </label>
              <input
                id="expense-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lunch"
                className="w-full rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
              />
            </div>

            <div>
              <label htmlFor="expense-amount" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
                <input
                  id="expense-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full rounded-control border border-border dark:border-border-dark bg-transparent py-2.5 pl-7 pr-3.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expense-date" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">Category</span>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    aria-pressed={categoryId === c.id}
                    className={`flex flex-col items-center gap-1.5 rounded-control border px-2 py-3 text-xs font-medium transition-colors ${
                      categoryId === c.id
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-border dark:border-border-dark text-muted hover:border-brand/50'
                    }`}
                  >
                    <CategoryIcon icon={c.icon} className="h-4 w-4" />
                    <span className="truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="expense-note" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Note <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="expense-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note"
                className="w-full resize-none rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-control bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border dark:border-border-dark px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-control bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {editingExpense ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
