import { getDB } from './db';
import type { MonthRecord, CategoryRecord, ExpenseRecord, SettingsRecord } from '@/types';

export const monthsRepo = {
  async getAll(): Promise<MonthRecord[]> {
    const db = await getDB();
    return db.getAll('months');
  },
  async getById(id: string): Promise<MonthRecord | undefined> {
    const db = await getDB();
    return db.get('months', id);
  },
  async put(record: MonthRecord): Promise<void> {
    const db = await getDB();
    await db.put('months', record);
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('months', id);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('months');
  },
};

export const categoriesRepo = {
  async getAll(): Promise<CategoryRecord[]> {
    const db = await getDB();
    return db.getAll('categories');
  },
  async getById(id: string): Promise<CategoryRecord | undefined> {
    const db = await getDB();
    return db.get('categories', id);
  },
  async put(record: CategoryRecord): Promise<void> {
    const db = await getDB();
    await db.put('categories', record);
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('categories', id);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('categories');
  },
};

export const expensesRepo = {
  async getAll(): Promise<ExpenseRecord[]> {
    const db = await getDB();
    return db.getAll('expenses');
  },
  async getByMonth(monthId: string): Promise<ExpenseRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('expenses', 'by-month', monthId);
  },
  async getByCategory(categoryId: string): Promise<ExpenseRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('expenses', 'by-category', categoryId);
  },
  async getById(id: string): Promise<ExpenseRecord | undefined> {
    const db = await getDB();
    return db.get('expenses', id);
  },
  async put(record: ExpenseRecord): Promise<void> {
    const db = await getDB();
    await db.put('expenses', record);
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('expenses', id);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('expenses');
  },
};

export const settingsRepo = {
  async getAll(): Promise<SettingsRecord[]> {
    const db = await getDB();
    return db.getAll('settings');
  },
  async get(key: string): Promise<string | undefined> {
    const db = await getDB();
    const rec = await db.get('settings', key);
    return rec?.value;
  },
  async set(key: string, value: string): Promise<void> {
    const db = await getDB();
    await db.put('settings', { key, value });
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('settings');
  },
};
