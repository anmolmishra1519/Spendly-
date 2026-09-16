import { useMemo } from 'react';
import { greetingForNow } from '@/utils/dates';
import { MonthSelector } from './MonthSelector';
import { Logo } from './Logo';
import { useSelectedMonth } from '@/hooks/useDerivedData';
import { useAppStore } from '@/stores/appStore';

export function Header({ subtitle }: { subtitle?: string }) {
  const greeting = useMemo(() => greetingForNow(), []);
  const month = useSelectedMonth();
  const userName = useAppStore((s) => s.settings.userName);

  return (
    <header className="sticky top-0 z-30 border-b border-border dark:border-border-dark bg-bg/90 dark:bg-bg-dark/90 backdrop-blur px-4 py-4 md:px-8 md:py-6">
      <div className="flex items-center justify-between md:hidden mb-3">
        <Logo size={28} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-ink-dark md:text-2xl">
            {greeting}
            {userName ? `, ${userName}` : ''}
          </h1>
          <p className="mt-0.5 text-sm text-muted dark:text-muted-dark">
            {subtitle ?? "Here's your spending overview."}
          </p>
        </div>
        {month && <MonthSelector />}
      </div>
    </header>
  );
}
