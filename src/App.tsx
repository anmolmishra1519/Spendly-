import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { AppShell } from '@/layouts/AppShell';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { Expenses } from '@/pages/Expenses';
import { Calendar } from '@/pages/Calendar';
import { Analytics } from '@/pages/Analytics';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

function useAppliedTheme() {
  const theme = useAppStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle('dark', dark);

    if (theme === 'dark') {
      apply(true);
    } else if (theme === 'light') {
      apply(false);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);
}

export default function App() {
  const ready = useAppStore((s) => s.ready);
  const init = useAppStore((s) => s.init);
  const months = useAppStore((s) => s.months);
  useAppliedTheme();

  useEffect(() => {
    init();
  }, [init]);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg dark:bg-bg-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-light border-t-brand" />
      </div>
    );
  }

  if (months.length === 0) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
