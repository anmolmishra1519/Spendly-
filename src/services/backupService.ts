import { monthsRepo, categoriesRepo, expensesRepo, settingsRepo } from '@/database/repositories';
import type { BackupPayload, ExpenseRecord, CategoryRecord, MonthRecord } from '@/types';
import { formatDisplayDateLong } from '@/utils/dates';

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const backupService = {
  async exportBackup(): Promise<void> {
    const [months, categories, expenses, settings] = await Promise.all([
      monthsRepo.getAll(),
      categoriesRepo.getAll(),
      expensesRepo.getAll(),
      settingsRepo.getAll(),
    ]);
    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      months,
      categories,
      expenses,
      settings,
    };
    downloadFile(JSON.stringify(payload, null, 2), `spendly-backup-${Date.now()}.json`, 'application/json');
  },

  validateBackup(data: unknown): data is BackupPayload {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return (
      d.version === 1 &&
      Array.isArray(d.months) &&
      Array.isArray(d.categories) &&
      Array.isArray(d.expenses) &&
      Array.isArray(d.settings)
    );
  },

  async importBackup(file: File): Promise<void> {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Unable to import this backup.');
    }
    if (!this.validateBackup(parsed)) {
      throw new Error('Unable to import this backup.');
    }
    const payload = parsed;
    // Replace-all import: clears existing data, then restores the backup exactly.
    await Promise.all([monthsRepo.clear(), categoriesRepo.clear(), expensesRepo.clear(), settingsRepo.clear()]);
    for (const m of payload.months as MonthRecord[]) await monthsRepo.put(m);
    for (const c of payload.categories as CategoryRecord[]) await categoriesRepo.put(c);
    for (const e of payload.expenses as ExpenseRecord[]) await expensesRepo.put(e);
    for (const s of payload.settings) await settingsRepo.set(s.key, s.value);
  },

  async clearAllData(): Promise<void> {
    await Promise.all([monthsRepo.clear(), categoriesRepo.clear(), expensesRepo.clear(), settingsRepo.clear()]);
  },

  exportMonthCSV(month: MonthRecord, expenses: ExpenseRecord[], categories: CategoryRecord[]): void {
    const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Other';
    const header = ['Date', 'Expense', 'Category', 'Amount', 'Note'];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const sorted = [...expenses].sort((a, b) =>
      a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1
    );
    const rows = sorted.map((e) =>
      [formatDisplayDateLong(e.date), e.name, categoryName(e.categoryId), e.amount.toFixed(2), e.note ?? '']
        .map(escape)
        .join(',')
    );
    const csv = [header.map(escape).join(','), ...rows].join('\n');
    downloadFile(csv, `spendly-${month.year}-${String(month.month).padStart(2, '0')}.csv`, 'text/csv');
  },
};
