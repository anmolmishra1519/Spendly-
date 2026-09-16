import { formatINR } from '@/utils/currency';

export function DailySuggestionCard({ available, dailySuggestion }: { available: number; dailySuggestion: number }) {
  const overBudget = available <= 0;

  return (
    <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-soft animate-fade-in-up">
      <p className="text-[13px] font-medium uppercase tracking-wide text-muted dark:text-muted-dark">
        Suggested daily spending
      </p>
      {overBudget ? (
        <p className="mt-2 text-sm font-medium text-danger">You're over budget. Consider reducing spending.</p>
      ) : (
        <>
          <p className="mt-1.5 text-2xl font-bold text-ink dark:text-ink-dark">{formatINR(dailySuggestion)}<span className="text-sm font-medium text-muted">/day</span></p>
          <p className="mt-1 text-xs text-muted dark:text-muted-dark">Based on your available money and the days left this month.</p>
        </>
      )}
    </div>
  );
}
