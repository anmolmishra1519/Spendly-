export interface MonthRecord {
  id: string;
  month: number; // 1-12
  year: number;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  monthId: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string; // ISO date, yyyy-MM-dd
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsRecord {
  key: string;
  value: string;
}

export interface AppSettings {
  theme: ThemeMode;
  currency: 'INR';
  userName: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  months: MonthRecord[];
  categories: CategoryRecord[];
  expenses: ExpenseRecord[];
  settings: SettingsRecord[];
}

export interface MonthSummary {
  month: MonthRecord;
  totalSpent: number;
  available: number;
  spentPercentage: number;
  transactionCount: number;
}

export interface CategoryBreakdownItem {
  category: CategoryRecord;
  total: number;
  percentage: number;
  count: number;
}
