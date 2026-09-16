import { v4 as uuid } from 'uuid';
import { monthsRepo, expensesRepo } from '@/database/repositories';
import type { MonthRecord, MonthSummary } from '@/types';
import { sumExpenses, calculateAvailable, calculateSpentPercentage } from '@/utils/calculations';

export const monthService = {
  async getAllMonths(): Promise<MonthRecord[]> {
    const months = await monthsRepo.getAll();
    return months.sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));
  },

  async getMonth(id: string): Promise<MonthRecord | undefined> {
    return monthsRepo.getById(id);
  },

  async findByMonthYear(month: number, year: number): Promise<MonthRecord | undefined> {
    const all = await monthsRepo.getAll();
    return all.find((m) => m.month === month && m.year === year);
  },

  /** Creates a new month with a user-entered budget. Never auto-fills a budget. */
  async createMonth(month: number, year: number, budget: number): Promise<MonthRecord> {
    const existing = await this.findByMonthYear(month, year);
    if (existing) {
      throw new Error('This month already exists.');
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      throw new Error('Enter a valid monthly budget.');
    }
    const now = new Date().toISOString();
    const record: MonthRecord = {
      id: uuid(),
      month,
      year,
      budget,
      createdAt: now,
      updatedAt: now,
    };
    await monthsRepo.put(record);
    return record;
  },

  async updateBudget(monthId: string, budget: number): Promise<MonthRecord> {
    const existing = await monthsRepo.getById(monthId);
    if (!existing) throw new Error('Month not found.');
    if (!Number.isFinite(budget) || budget <= 0) {
      throw new Error('Enter a valid monthly budget.');
    }
    const updated: MonthRecord = { ...existing, budget, updatedAt: new Date().toISOString() };
    await monthsRepo.put(updated);
    return updated;
  },

  async deleteMonth(monthId: string): Promise<void> {
    const expenses = await expensesRepo.getByMonth(monthId);
    await Promise.all(expenses.map((e) => expensesRepo.delete(e.id)));
    await monthsRepo.delete(monthId);
  },

  async getSummary(monthRecord: MonthRecord): Promise<MonthSummary> {
    const expenses = await expensesRepo.getByMonth(monthRecord.id);
    const totalSpent = sumExpenses(expenses);
    const available = calculateAvailable(monthRecord.budget, totalSpent);
    const spentPercentage = calculateSpentPercentage(monthRecord.budget, totalSpent);
    return {
      month: monthRecord,
      totalSpent,
      available,
      spentPercentage,
      transactionCount: expenses.length,
    };
  },

  async getAllSummaries(): Promise<MonthSummary[]> {
    const months = await this.getAllMonths();
    return Promise.all(months.map((m) => this.getSummary(m)));
  },
};
