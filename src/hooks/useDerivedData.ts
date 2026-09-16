import { useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  sumExpenses,
  calculateAvailable,
  calculateSpentPercentage,
  suggestedDailySpending,
} from '@/utils/calculations';
import type { CategoryBreakdownItem } from '@/types';

export function useSelectedMonth() {
  const months = useAppStore((s) => s.months);
  const selectedMonthId = useAppStore((s) => s.selectedMonthId);
  return useMemo(() => months.find((m) => m.id === selectedMonthId) ?? null, [months, selectedMonthId]);
}

export function useMonthSummary() {
  const month = useSelectedMonth();
  const expenses = useAppStore((s) => s.expenses);

  return useMemo(() => {
    if (!month) return null;
    const totalSpent = sumExpenses(expenses);
    const available = calculateAvailable(month.budget, totalSpent);
    const spentPercentage = calculateSpentPercentage(month.budget, totalSpent);
    const dailySuggestion = suggestedDailySpending(available, month.year, month.month);
    return {
      month,
      totalSpent,
      available,
      spentPercentage,
      transactionCount: expenses.length,
      dailySuggestion,
    };
  }, [month, expenses]);
}

export function useCategoryBreakdown(): CategoryBreakdownItem[] {
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);

  return useMemo(() => {
    const totalSpent = sumExpenses(expenses);
    const totals = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const entry = totals.get(e.categoryId) ?? { total: 0, count: 0 };
      entry.total += e.amount;
      entry.count += 1;
      totals.set(e.categoryId, entry);
    }
    const items: CategoryBreakdownItem[] = [];
    for (const [categoryId, { total, count }] of totals) {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) continue;
      items.push({
        category,
        total,
        count,
        percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
      });
    }
    return items.sort((a, b) => b.total - a.total);
  }, [categories, expenses]);
}
