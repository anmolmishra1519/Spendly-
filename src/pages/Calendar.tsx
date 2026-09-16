import { useMemo, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useSelectedMonth } from '@/hooks/useDerivedData';
import { formatINR } from '@/utils/currency';
import { CategoryIcon, CalendarDays } from '@/components/icons';
import { EmptyState } from '@/components/EmptyState';

export function Calendar() {
  const month = useSelectedMonth();
  const expenses = useAppStore((s) => s.expenses);
  const categories = useAppStore((s) => s.categories);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { cells, totalsByDate } = useMemo(() => {
    if (!month) return { cells: [], totalsByDate: new Map<string, number>() };
    const totals = new Map<string, number>();
    for (const e of expenses) {
      totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);
    }
    const firstOfMonth = new Date(month.year, month.month - 1, 1);
    const daysInMonth = new Date(month.year, month.month, 0).getDate();
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const cellList: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < startWeekday; i++) cellList.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${month.year}-${String(month.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cellList.push({ day: d, iso });
    }
    return { cells: cellList, totalsByDate: totals };
  }, [month, expenses]);

  if (!month) return null;

  const dayExpenses = selectedDate ? expenses.filter((e) => e.date === selectedDate) : [];
  const dayTotal = selectedDate ? totalsByDate.get(selectedDate) ?? 0 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark">Calendar</h2>
        <p className="text-sm text-muted dark:text-muted-dark">See what you spent, day by day.</p>
      </div>

      <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 shadow-soft md:p-6">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1.5">{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;
            const total = totalsByDate.get(cell.iso);
            const isSelected = selectedDate === cell.iso;
            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDate(cell.iso)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[10px] text-sm transition-colors ${
                  isSelected ? 'bg-brand text-white' : total ? 'bg-brand-light text-brand font-semibold' : 'text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5'
                }`}
              >
                <span>{cell.day}</span>
                {total ? <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand'}`} /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
        {!selectedDate ? (
          <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Pick a date" description="Select a day on the calendar to see what you spent." />
        ) : dayExpenses.length === 0 ? (
          <EmptyState title="No expenses on this date." />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </h3>
              <span className="text-sm font-bold text-danger">Daily Total: {formatINR(dayTotal)}</span>
            </div>
            <ul className="mt-3 divide-y divide-border dark:divide-border-dark">
              {dayExpenses.map((e) => {
                const category = categories.find((c) => c.id === e.categoryId);
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category?.color ?? '#4F8CFF'}1A`, color: category?.color ?? '#4F8CFF' }}
                    >
                      <CategoryIcon icon={category?.icon ?? 'more-horizontal'} className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-sm text-ink dark:text-ink-dark">{e.name}</span>
                    <span className="text-sm font-semibold text-danger">{formatINR(e.amount)}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
