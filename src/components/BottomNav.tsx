import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Wallet2, FileText, SettingsIcon, Plus } from './icons';

export function BottomNav({ onAddExpense }: { onAddExpense: () => void }) {
  const navigate = useNavigate();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
      isActive ? 'text-brand' : 'text-muted'
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-border dark:border-border-dark bg-surface/95 dark:bg-surface-dark/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <NavLink to="/" end className={itemClass}>
        <LayoutGrid className="h-5 w-5" />
        Home
      </NavLink>
      <NavLink to="/expenses" className={itemClass}>
        <Wallet2 className="h-5 w-5" />
        Expenses
      </NavLink>

      <div className="flex flex-1 justify-center">
        <button
          onClick={onAddExpense}
          aria-label="Add expense"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-soft transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <NavLink to="/reports" className={itemClass}>
        <FileText className="h-5 w-5" />
        Reports
      </NavLink>
      <button onClick={() => navigate('/settings')} className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted">
        <SettingsIcon className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}
