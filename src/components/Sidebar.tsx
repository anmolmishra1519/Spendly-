import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { LayoutGrid, Wallet2, CalendarIcon, BarChart3, FileText, SettingsIcon } from './icons';
import { useSelectedMonth } from '@/hooks/useDerivedData';
import { monthLabel } from '@/utils/dates';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet2 },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export function Sidebar() {
  const month = useSelectedMonth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border dark:md:border-border-dark md:bg-surface dark:md:bg-surface-dark md:px-4 md:py-6">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-brand'
                  : 'text-muted hover:bg-bg dark:hover:bg-white/5 hover:text-ink dark:hover:text-ink-dark'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        {month && (
          <div className="mb-2 rounded-control bg-bg dark:bg-white/5 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Current month</p>
            <p className="text-sm font-semibold text-ink dark:text-ink-dark">{monthLabel(month.month, month.year)}</p>
          </div>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-light text-brand'
                : 'text-muted hover:bg-bg dark:hover:bg-white/5 hover:text-ink dark:hover:text-ink-dark'
            }`
          }
        >
          <SettingsIcon className="h-[18px] w-[18px]" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
