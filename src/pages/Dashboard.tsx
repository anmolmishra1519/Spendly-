import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useMonthSummary, useCategoryBreakdown } from '@/hooks/useDerivedData';
import { BalanceCard } from '@/components/BalanceCard';
import { SummaryCards } from '@/components/SummaryCards';
import { DailySuggestionCard } from '@/components/DailySuggestionCard';
import { CategoryBreakdownChart } from '@/components/CategoryBreakdownChart';
import { RecentExpenses } from '@/components/RecentExpenses';
import { PreviousMonths } from '@/components/PreviousMonths';
import { EditBudgetModal } from '@/components/EditBudgetModal';

type OutletCtx = { openAddExpense: () => void };

export function Dashboard() {
  const { openAddExpense } = useOutletContext<OutletCtx>();
  const expenses = useAppStore((s) => s.expenses);
  const categories = useAppStore((s) => s.categories);
  const summary = useMonthSummary();
  const breakdown = useCategoryBreakdown();
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);

  if (!summary) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-5 md:space-y-6">
      <BalanceCard
        available={summary.available}
        budget={summary.month.budget}
        spentPercentage={summary.spentPercentage}
        onEditBudget={() => setEditBudgetOpen(true)}
      />

      <SummaryCards
        budget={summary.month.budget}
        spent={summary.totalSpent}
        available={summary.available}
        transactions={summary.transactionCount}
      />

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2 space-y-5 md:space-y-6">
          <CategoryBreakdownChart items={breakdown} />
          <RecentExpenses expenses={expenses} categories={categories} onAdd={openAddExpense} />
        </div>
        <div className="space-y-5 md:space-y-6">
          <DailySuggestionCard available={summary.available} dailySuggestion={summary.dailySuggestion} />
          <button
            onClick={openAddExpense}
            className="hidden w-full rounded-control bg-brand py-3 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-95 md:block"
          >
            + Add Expense
          </button>
        </div>
      </div>

      <PreviousMonths />

      <EditBudgetModal open={editBudgetOpen} onClose={() => setEditBudgetOpen(false)} />
    </div>
  );
}
