import { create } from 'zustand';
import type { MonthRecord, CategoryRecord, ExpenseRecord, AppSettings } from '@/types';
import { monthService } from '@/services/monthService';
import { categoryService } from '@/services/categoryService';
import { expenseService, type ExpenseInput } from '@/services/expenseService';
import { settingsService } from '@/services/settingsService';
import { backupService } from '@/services/backupService';
import { currentMonthYear } from '@/utils/dates';

interface AppState {
  ready: boolean;
  months: MonthRecord[];
  categories: CategoryRecord[];
  expenses: ExpenseRecord[]; // expenses for the currently selected month
  selectedMonthId: string | null;
  settings: AppSettings;
  toast: { id: number; message: string; tone: 'success' | 'error' | 'info' } | null;

  init: () => Promise<void>;
  selectMonth: (monthId: string) => Promise<void>;
  createMonth: (month: number, year: number, budget: number) => Promise<MonthRecord>;
  updateBudget: (budget: number) => Promise<void>;
  addExpense: (input: Omit<ExpenseInput, 'monthId'>) => Promise<void>;
  updateExpense: (id: string, input: Omit<ExpenseInput, 'monthId'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (name: string, icon: string, color?: string) => Promise<void>;
  updateCategory: (id: string, patch: Partial<Pick<CategoryRecord, 'name' | 'icon' | 'color'>>) => Promise<void>;
  deleteCategory: (id: string, reassignCategoryId?: string) => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  reloadAll: () => Promise<void>;
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  months: [],
  categories: [],
  expenses: [],
  selectedMonthId: null,
  settings: { theme: 'light', currency: 'INR', userName: '' },
  toast: null,

  init: async () => {
    await categoryService.ensureDefaults();
    const [months, categories, settings] = await Promise.all([
      monthService.getAllMonths(),
      categoryService.getAll(),
      settingsService.getSettings(),
    ]);

    let selectedMonthId = get().selectedMonthId;
    if (!selectedMonthId && months.length > 0) {
      const { month, year } = currentMonthYear();
      const current = months.find((m) => m.month === month && m.year === year);
      selectedMonthId = (current ?? months[0]).id;
    }

    const expenses = selectedMonthId ? await expenseService.getByMonth(selectedMonthId) : [];
    set({ ready: true, months, categories, settings, selectedMonthId, expenses });
  },

  reloadAll: async () => {
    const { selectedMonthId } = get();
    const [months, categories] = await Promise.all([monthService.getAllMonths(), categoryService.getAll()]);
    const expenses = selectedMonthId ? await expenseService.getByMonth(selectedMonthId) : [];
    set({ months, categories, expenses });
  },

  selectMonth: async (monthId: string) => {
    const expenses = await expenseService.getByMonth(monthId);
    set({ selectedMonthId: monthId, expenses });
  },

  createMonth: async (month, year, budget) => {
    const record = await monthService.createMonth(month, year, budget);
    await get().reloadAll();
    set({ selectedMonthId: record.id, expenses: [] });
    return record;
  },

  updateBudget: async (budget: number) => {
    const { selectedMonthId } = get();
    if (!selectedMonthId) return;
    await monthService.updateBudget(selectedMonthId, budget);
    await get().reloadAll();
  },

  addExpense: async (input) => {
    const { selectedMonthId } = get();
    if (!selectedMonthId) throw new Error('Create a month first.');
    await expenseService.add({ ...input, monthId: selectedMonthId });
    await get().reloadAll();
    get().showToast('Expense added successfully.', 'success');
  },

  updateExpense: async (id, input) => {
    const { selectedMonthId } = get();
    if (!selectedMonthId) throw new Error('Create a month first.');
    await expenseService.update(id, { ...input, monthId: selectedMonthId });
    await get().reloadAll();
    get().showToast('Expense updated.', 'success');
  },

  deleteExpense: async (id: string) => {
    await expenseService.remove(id);
    await get().reloadAll();
    get().showToast('Expense deleted.', 'info');
  },

  addCategory: async (name, icon, color) => {
    await categoryService.create(name, icon, color);
    await get().reloadAll();
  },

  updateCategory: async (id, patch) => {
    await categoryService.update(id, patch);
    await get().reloadAll();
  },

  deleteCategory: async (id, reassignCategoryId) => {
    await categoryService.delete(id, reassignCategoryId);
    await get().reloadAll();
  },

  setTheme: async (theme) => {
    await settingsService.setTheme(theme);
    set((s) => ({ settings: { ...s.settings, theme } }));
  },

  setUserName: async (name: string) => {
    await settingsService.setUserName(name);
    set((s) => ({ settings: { ...s.settings, userName: name.trim() } }));
  },

  clearAllData: async () => {
    await backupService.clearAllData();
    set({ months: [], categories: [], expenses: [], selectedMonthId: null });
    await get().init();
  },

  showToast: (message, tone = 'info') => {
    set({ toast: { id: Date.now(), message, tone } });
  },
  dismissToast: () => set({ toast: null }),
}));
