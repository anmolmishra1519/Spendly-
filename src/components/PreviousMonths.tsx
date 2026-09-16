import { useEffect, useState } from 'react';
import { monthService } from '@/services/monthService';
import type { MonthSummary } from '@/types';
import { monthLabel } from '@/utils/dates';
import { formatINR } from '@/utils/currency';
import { EmptyState } from './EmptyState';
import { useAppStore } from '@/stores/appStore';

export function PreviousMonths() {
  const months = useAppStore((s) => s.months);
  const selectedMonthId = useAppStore((s) => s.selectedMonthId);
  const selectMonth = useAppStore((s) => s.selectMonth);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);

  useEffect(() => {
    monthService.getAllSummaries().then(setSummaries);
  }, [months]);

  const others = summaries.filter((s) => s.month.id !== selectedMonthId);

  return (
    <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft">
      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Previous Months</h3>
      {others.length === 0 ? (
        <EmptyState title="No previous months yet." />
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map(({ month, totalSpent, available, transactionCount }) => (
            <button
              key={month.id}
              onClick={() => selectMonth(month.id)}
              className="rounded-control border border-border dark:border-border-dark p-4 text-left transition-colors hover:border-brand"
            >
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">{monthLabel(month.month, month.year)}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted">Budget</p>
                  <p className="font-medium text-ink dark:text-ink-dark">{formatINR(month.budget)}</p>
                </div>
                <div>
                  <p className="text-muted">Spent</p>
                  <p className="font-medium text-ink dark:text-ink-dark">{formatINR(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-muted">Txns</p>
                  <p className="font-medium text-ink dark:text-ink-dark">{transactionCount}</p>
                </div>
              </div>
              <p className={`mt-2 text-xs font-semibold ${available < 0 ? 'text-danger' : 'text-success'}`}>
                {available < 0 ? `${formatINR(Math.abs(available))} over budget` : `${formatINR(available)} available`}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
