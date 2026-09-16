import { v4 as uuid } from 'uuid';
import { expensesRepo } from '@/database/repositories';
import type { ExpenseRecord } from '@/types';

export interface ExpenseInput {
  monthId: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  note?: string;
}

function validate(input: ExpenseInput) {
  if (!input.name || !input.name.trim()) throw new Error('Give this expense a name.');
  if (!input.amount || !Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Enter an amount greater than 0.');
  }
  if (!input.date) throw new Error('Pick a date.');
  if (!input.categoryId) throw new Error('Choose a category.');
  if (!input.monthId) throw new Error('This expense needs to belong to a month.');
}

export const expenseService = {
  async getByMonth(monthId: string): Promise<ExpenseRecord[]> {
    const expenses = await expensesRepo.getByMonth(monthId);
    return expenses.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)));
  },

  async getById(id: string): Promise<ExpenseRecord | undefined> {
    return expensesRepo.getById(id);
  },

  async add(input: ExpenseInput): Promise<ExpenseRecord> {
    validate(input);
    const now = new Date().toISOString();
    const record: ExpenseRecord = {
      id: uuid(),
      monthId: input.monthId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      amount: input.amount,
      date: input.date,
      note: input.note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await expensesRepo.put(record);
    return record;
  },

  async update(id: string, input: ExpenseInput): Promise<ExpenseRecord> {
    validate(input);
    const existing = await expensesRepo.getById(id);
    if (!existing) throw new Error('Expense not found.');
    const updated: ExpenseRecord = {
      ...existing,
      monthId: input.monthId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      amount: input.amount,
      date: input.date,
      note: input.note?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await expensesRepo.put(updated);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await expensesRepo.delete(id);
  },
};
