import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useSelectedMonth } from '@/hooks/useDerivedData';
import { monthLabel } from '@/utils/dates';
import { ChevronDown, Plus } from './icons';
import { CreateMonthModal } from './CreateMonthModal';

export function MonthSelector() {
  const months = useAppStore((s) => s.months);
  const selectMonth = useAppStore((s) => s.selectMonth);
  const selected = useSelectedMonth();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!selected) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-control border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2 text-sm font-semibold text-ink dark:text-ink-dark hover:border-brand transition-colors"
      >
        {monthLabel(selected.month, selected.year)}
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 max-h-72 w-52 overflow-auto rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-1.5 shadow-soft animate-scale-in"
        >
          {months.map((m) => (
            <button
              key={m.id}
              role="option"
              aria-selected={m.id === selected.id}
              onClick={() => {
                selectMonth(m.id);
                setOpen(false);
              }}
              className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm transition-colors ${
                m.id === selected.id
                  ? 'bg-brand-light font-semibold text-brand'
                  : 'text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5'
              }`}
            >
              {monthLabel(m.month, m.year)}
            </button>
          ))}
          <div className="my-1 h-px bg-border dark:bg-border-dark" />
          <button
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className="flex w-full items-center gap-1.5 rounded-[8px] px-3 py-2 text-left text-sm font-medium text-brand hover:bg-brand-light"
          >
            <Plus className="h-4 w-4" /> New month
          </button>
        </div>
      )}
      <CreateMonthModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
