import { formatINR } from '@/utils/currency';
import { spendingStatusMessage } from '@/utils/calculations';

export function BalanceCard({
  available,
  budget,
  spentPercentage,
}: {
  available: number;
  budget: number;
  spentPercentage: number;
}) {
  const overBudget = available < 0;
  const pctLabel = `${spentPercentage.toFixed(1)}% spent`;
  const statusMessage = spendingStatusMessage(spentPercentage);

  const barColor =
    spentPercentage > 100 ? 'bg-danger' : spentPercentage >= 90 ? 'bg-warning' : spentPercentage >= 75 ? 'bg-warning' : 'bg-brand';

  return (
    <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-soft animate-fade-in-up md:p-8">
      <p className="text-[13px] font-medium uppercase tracking-wide text-muted dark:text-muted-dark">
        {overBudget ? 'Budget Exceeded' : 'Available Money'}
      </p>

      <p
        className={`mt-2 text-[40px] font-extrabold leading-none tracking-tight md:text-[48px] ${
          overBudget ? 'text-danger' : 'text-ink dark:text-ink-dark'
        }`}
      >
        {overBudget ? `-${formatINR(Math.abs(available))}` : formatINR(available)}
      </p>

      <p className="mt-2 text-sm text-muted dark:text-muted-dark">
        {overBudget ? (
          <>
            <span className="font-semibold text-danger">{formatINR(Math.abs(available))} over budget</span> · of{' '}
            {formatINR(budget)} budget
          </>
        ) : (
          <>of {formatINR(budget)} budget</>
        )}
      </p>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted dark:text-muted-dark">{pctLabel}</span>
          <span
            className={`font-semibold ${
              spentPercentage > 100 ? 'text-danger' : spentPercentage >= 75 ? 'text-warning' : 'text-success'
            }`}
          >
            {statusMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
