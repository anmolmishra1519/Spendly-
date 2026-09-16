import type { ExpenseRecord, CategoryRecord } from '@/types';
import { formatSignedINR } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';
import { CategoryIcon, Wallet2 } from './icons';
import { EmptyState } from './EmptyState';

export function RecentExpenses({
  expenses,
  categories,
  onAdd,
  limit = 5,
}: {
  expenses: ExpenseRecord[];
  categories: CategoryRecord[];
  onAdd: () => void;
  limit?: number;
}) {
  const categoryFor = (id: string) => categories.find((c) => c.id === id);

  return (
    <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Recent Expenses</h3>
        {expenses.length > 0 && (
          <button onClick={onAdd} className="text-xs font-semibold text-brand hover:underline">
            + Add Expense
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={<Wallet2 className="h-6 w-6" />}
          title="No expenses yet."
          description="Start tracking your spending to see your transactions here."
          action={
            <button onClick={onAdd} className="rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
              + Add Expense
            </button>
          }
        />
      ) : (
        <ul className="mt-3 divide-y divide-border dark:divide-border-dark">
          {expenses.slice(0, limit).map((e) => {
            const category = categoryFor(e.categoryId);
            return (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${category?.color ?? '#4F8CFF'}1A`, color: category?.color ?? '#4F8CFF' }}
                >
                  <CategoryIcon icon={category?.icon ?? 'more-horizontal'} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">{e.name}</p>
                  <p className="text-xs text-muted dark:text-muted-dark">{category?.name ?? 'Other'} · {formatDisplayDate(e.date)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-danger">{formatSignedINR(-e.amount)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
