import type { MonthRecord, ExpenseRecord, CategoryRecord } from '@/types';
import { generateMonthlyReportPDF } from '@/reports/pdfReport';
import { backupService } from './backupService';

export const reportService = {
  downloadPDF(month: MonthRecord, expenses: ExpenseRecord[], categories: CategoryRecord[]): void {
    const doc = generateMonthlyReportPDF(month, expenses, categories);
    doc.save(`spendly-report-${month.year}-${String(month.month).padStart(2, '0')}.pdf`);
  },

  printPDF(month: MonthRecord, expenses: ExpenseRecord[], categories: CategoryRecord[]): void {
    const doc = generateMonthlyReportPDF(month, expenses, categories);
    doc.autoPrint();
    window.open(doc.output('bloburl') as unknown as string, '_blank');
  },

  exportCSV(month: MonthRecord, expenses: ExpenseRecord[], categories: CategoryRecord[]): void {
    backupService.exportMonthCSV(month, expenses, categories);
  },
};
