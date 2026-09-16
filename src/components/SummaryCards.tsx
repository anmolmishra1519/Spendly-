import { formatINR } from '@/utils/currency';
import { Wallet2, TrendingDown, TrendingUp, ArrowUpDown } from './icons';

export function SummaryCards({
  budget,
  spent,
  available,
  transactions,
}: {
  budget: number;
  spent: number;
  available: number;
  transactions: number;
}) {
  const items = [
    { label: 'Monthly Budget', value: formatINR(budget), icon: Wallet2, tone: 'text-brand', bg: 'bg-brand-light' },
    { label: 'Money Spent', value: formatINR(spent), icon: TrendingDown, tone: 'text-danger', bg: 'bg-danger/10' },
    {
      label: 'Available',
      value: available < 0 ? `-${formatINR(Math.abs(available))}` : formatINR(available),
      icon: TrendingUp,
      tone: available < 0 ? 'text-danger' : 'text-success',
      bg: available < 0 ? 'bg-danger/10' : 'bg-success/10',
    },
    { label: 'Transactions', value: String(transactions), icon: ArrowUpDown, tone: 'text-ink dark:text-ink-dark', bg: 'bg-bg dark:bg-white/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map(({ label, value, icon: Icon, tone, bg }, i) => (
        <div
          key={label}
          className="animate-fade-in-up rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 shadow-soft"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] ${bg}`}>
            <Icon className={`h-4.5 w-4.5 ${tone}`} />
          </div>
          <p className="text-[13px] font-medium text-muted dark:text-muted-dark">{label}</p>
          <p className="mt-1 text-lg font-bold text-ink dark:text-ink-dark md:text-xl">{value}</p>
        </div>
      ))}
    </div>
  );
}
