import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useAppStore } from '@/stores/appStore';
import { useMonthSummary, useCategoryBreakdown } from '@/hooks/useDerivedData';
import { averageDailySpend, highestSpendingDay } from '@/utils/calculations';
import { formatINR } from '@/utils/currency';
import { formatDisplayDateLong } from '@/utils/dates';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon, BarChart3 } from '@/components/icons';

export function Analytics() {
  const expenses = useAppStore((s) => s.expenses);
  const summary = useMonthSummary();
  const breakdown = useCategoryBreakdown();

  const avgDaily = useMemo(
    () => (summary ? averageDailySpend(expenses, summary.month.year, summary.month.month) : 0),
    [expenses, summary]
  );
  const highestDay = useMemo(() => highestSpendingDay(expenses), [expenses]);
  const topCategory = breakdown[0];

  const trendData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const e of expenses) byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount);
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, total]) => ({ date: date.slice(8), total }));
  }, [expenses]);

  if (!summary) return null;

  const hasData = expenses.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark">Analytics</h2>
        <p className="text-sm text-muted dark:text-muted-dark">Real numbers, calculated from your own spending.</p>
      </div>

      {!hasData ? (
        <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
          <EmptyState icon={<BarChart3 className="h-6 w-6" />} title="Not enough data yet." description="Add a few expenses to see your spending insights here." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Average Daily Spending', value: formatINR(avgDaily) },
              { label: 'Highest Spending Day', value: highestDay ? formatINR(highestDay.total) : '—', sub: highestDay ? formatDisplayDateLong(highestDay.date) : undefined },
              { label: 'Highest Category', value: topCategory ? topCategory.category.name : '—', sub: topCategory ? formatINR(topCategory.total) : undefined },
              { label: 'Budget Utilization', value: `${summary.spentPercentage.toFixed(1)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 shadow-soft">
                <p className="text-[12px] font-medium text-muted dark:text-muted-dark">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-ink dark:text-ink-dark">{item.value}</p>
                {item.sub && <p className="text-xs text-muted dark:text-muted-dark">{item.sub}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Monthly Spending Trend</h3>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF2" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Bar dataKey="total" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Category Spending</h3>
            <ul className="mt-3 space-y-3">
              {breakdown.map((item) => (
                <li key={item.category.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink dark:text-ink-dark">
                      <CategoryIcon icon={item.category.icon} className="h-4 w-4" style={{ color: item.category.color }} />
                      {item.category.name}
                    </span>
                    <span className="font-semibold text-ink dark:text-ink-dark">{formatINR(item.total)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg dark:bg-white/10">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${item.percentage}%`, backgroundColor: item.category.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
