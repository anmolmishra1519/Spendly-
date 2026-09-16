import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import type { ExpenseRecord } from '@/types';
import { formatSignedINR } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';
import { CategoryIcon, Search, Pencil, Trash2, ArrowUpDown, Wallet2 } from '@/components/icons';
import { EmptyState } from '@/components/EmptyState';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type OutletCtx = { openAddExpense: () => void };
type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

export function Expenses() {
  const { openAddExpense } = useOutletContext<OutletCtx>();
  const expenses = useAppStore((s) => s.expenses);
  const categories = useAppStore((s) => s.categories);
  const deleteExpense = useAppStore((s) => s.deleteExpense);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);
  const [toDelete, setToDelete] = useState<ExpenseRecord | null>(null);

  const categoryFor = (id: string) => categories.find((c) => c.id === id);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q) || categoryFor(e.categoryId)?.name.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter((e) => e.categoryId === categoryFilter);
    }
    switch (sort) {
      case 'newest':
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
        break;
      case 'oldest':
        list.sort((a, b) => (a.date > b.date ? 1 : -1));
        break;
      case 'highest':
        list.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        list.sort((a, b) => a.amount - b.amount);
        break;
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, query, categoryFilter, sort, categories]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark">All Expenses</h2>
        <p className="text-sm text-muted dark:text-muted-dark">View and manage everything you've spent.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses"
            className="w-full rounded-control border border-border dark:border-border-dark bg-surface dark:bg-surface-dark py-2.5 pl-10 pr-3.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-control border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-control border border-border dark:border-border-dark bg-surface dark:bg-surface-dark py-2.5 pl-9 pr-3.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
          <EmptyState
            icon={<Wallet2 className="h-6 w-6" />}
            title={expenses.length === 0 ? 'No expenses yet.' : 'No expenses found.'}
            description={
              expenses.length === 0
                ? 'Start tracking your spending to see your transactions here.'
                : 'Try a different search term or filter.'
            }
            action={
              expenses.length === 0 && (
                <button onClick={openAddExpense} className="rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
                  + Add Expense
                </button>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Expense</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const category = categoryFor(e.categoryId);
                  return (
                    <tr key={e.id} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-bg dark:hover:bg-white/5">
                      <td className="px-5 py-3.5 text-muted dark:text-muted-dark">{formatDisplayDate(e.date)}</td>
                      <td className="px-5 py-3.5 font-medium text-ink dark:text-ink-dark">{e.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-ink dark:text-ink-dark">
                          <CategoryIcon icon={category?.icon ?? 'more-horizontal'} className="h-3.5 w-3.5" />
                          {category?.name ?? 'Other'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-danger">{formatSignedINR(-e.amount)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => setEditing(e)} aria-label={`Edit ${e.name}`} className="rounded-[8px] p-1.5 text-muted hover:bg-bg dark:hover:bg-white/10 hover:text-brand">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setToDelete(e)} aria-label={`Delete ${e.name}`} className="rounded-[8px] p-1.5 text-muted hover:bg-bg dark:hover:bg-white/10 hover:text-danger">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 md:hidden">
            {filtered.map((e) => {
              const category = categoryFor(e.categoryId);
              return (
                <div key={e.id} className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category?.color ?? '#4F8CFF'}1A`, color: category?.color ?? '#4F8CFF' }}
                    >
                      <CategoryIcon icon={category?.icon ?? 'more-horizontal'} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">{e.name}</p>
                        <span className="shrink-0 text-sm font-semibold text-danger">{formatSignedINR(-e.amount)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted dark:text-muted-dark">
                        {category?.name ?? 'Other'} · {formatDisplayDate(e.date)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setEditing(e)} className="flex-1 rounded-control border border-border dark:border-border-dark py-2 text-xs font-semibold text-ink dark:text-ink-dark">
                      Edit
                    </button>
                    <button onClick={() => setToDelete(e)} className="flex-1 rounded-control border border-danger/30 py-2 text-xs font-semibold text-danger">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AddExpenseModal open={!!editing} onClose={() => setEditing(null)} editingExpense={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this expense?"
        description={toDelete ? `${formatSignedINR(toDelete.amount).replace('-', '')} spent on ${categoryFor(toDelete.categoryId)?.name ?? 'this category'} will be permanently removed.` : undefined}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await deleteExpense(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
