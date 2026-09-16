import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryBreakdownItem } from '@/types';
import { formatINR } from '@/utils/currency';
import { EmptyState } from './EmptyState';
import { CategoryIcon } from './icons';

export function CategoryBreakdownChart({ items }: { items: CategoryBreakdownItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
        <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Spending by Category</h3>
        <EmptyState
          title="No spending data yet."
          description="Your category breakdown will appear once you add expenses."
        />
      </div>
    );
  }

  const data = items.map((i) => ({ name: i.category.name, value: i.total, color: i.category.color ?? '#4F8CFF' }));

  return (
    <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft animate-fade-in-up">
      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Spending by Category</h3>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={2}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatINR(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full flex-1 space-y-2.5">
          {items.slice(0, 6).map((item) => (
            <div key={item.category.id} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.category.color ?? '#4F8CFF'}1A`, color: item.category.color ?? '#4F8CFF' }}
              >
                <CategoryIcon icon={item.category.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 truncate text-sm text-ink dark:text-ink-dark">{item.category.name}</span>
              <span className="text-sm font-semibold text-ink dark:text-ink-dark">{formatINR(item.total)}</span>
              <span className="w-11 shrink-0 text-right text-xs text-muted">{item.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
