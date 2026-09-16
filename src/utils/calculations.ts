import type { ExpenseRecord } from '@/types';
import { getDaysInMonth, differenceInCalendarDays, startOfDay } from 'date-fns';

export function sumExpenses(expenses: ExpenseRecord[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calculateAvailable(budget: number, totalSpent: number): number {
  return budget - totalSpent;
}

export function calculateSpentPercentage(budget: number, totalSpent: number): number {
  if (budget <= 0) return totalSpent > 0 ? 100 : 0;
  return (totalSpent / budget) * 100;
}

export function spendingStatusMessage(percentage: number): string {
  if (percentage > 100) return 'Budget exceeded';
  if (percentage >= 90) return 'Budget almost used';
  if (percentage >= 75) return 'Watch your spending';
  if (percentage >= 50) return "You're on track";
  return "You're doing great";
}

export function remainingDaysInMonth(year: number, month: number /* 1-12 */): number {
  const today = startOfDay(new Date());
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const totalDays = getDaysInMonth(new Date(year, month - 1, 1));

  if (!isCurrentMonth) {
    // For past/future months there's no "remaining" concept tied to today;
    // fall back to the full month length so the suggestion is still meaningful.
    return totalDays;
  }

  const lastDay = new Date(year, month - 1, totalDays);
  const remaining = differenceInCalendarDays(lastDay, today) + 1;
  return Math.max(remaining, 1);
}

export function suggestedDailySpending(available: number, year: number, month: number): number {
  const days = remainingDaysInMonth(year, month);
  if (available <= 0) return 0;
  return available / days;
}

export function averageDailySpend(expenses: ExpenseRecord[], year: number, month: number): number {
  if (expenses.length === 0) return 0;
  const uniqueDays = new Set(expenses.map((e) => e.date));
  const totalDays = getDaysInMonth(new Date(year, month - 1, 1));
  const divisor = Math.min(Math.max(uniqueDays.size, 1), totalDays);
  return sumExpenses(expenses) / divisor;
}

export function highestSpendingDay(expenses: ExpenseRecord[]): { date: string; total: number } | null {
  if (expenses.length === 0) return null;
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);
  }
  let best: { date: string; total: number } | null = null;
  for (const [date, total] of totals) {
    if (!best || total > best.total) best = { date, total };
  }
  return best;
}
