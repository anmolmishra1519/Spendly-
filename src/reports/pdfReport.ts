import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MonthRecord, ExpenseRecord, CategoryRecord } from '@/types';
import { formatINRForPDF } from '@/utils/currency';
import { formatDisplayDateLong, monthLabel } from '@/utils/dates';
import { sumExpenses } from '@/utils/calculations';
import { SPENDLY_LOGO_PNG_BASE64 } from '@/assets/logoBase64';

const INK: [number, number, number] = [23, 32, 51];
const MUTED: [number, number, number] = [102, 112, 133];
const BRAND_BLUE: [number, number, number] = [79, 140, 255];

export function generateMonthlyReportPDF(
  month: MonthRecord,
  expenses: ExpenseRecord[],
  categories: CategoryRecord[]
): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // Header — real Spendly brand mark
  doc.addImage(SPENDLY_LOGO_PNG_BASE64, 'PNG', margin, y - 26, 30, 30);

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SPENDLY', margin + 38, y - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Monthly Expense Report', margin + 38, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(monthLabel(month.month, month.year), pageWidth - margin, 40, { align: 'right' });

  y += 40;
  doc.setDrawColor(228, 234, 242);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // Summary
  const totalSpent = sumExpenses(expenses);
  const available = month.budget - totalSpent;
  const summary: Array<[string, string]> = [
    ['Monthly Budget', formatINRForPDF(month.budget)],
    ['Total Spent', formatINRForPDF(totalSpent)],
    ['Available Balance', formatINRForPDF(available)],
    ['Total Transactions', String(expenses.length)],
  ];

  const cardWidth = (pageWidth - margin * 2 - 24) / 2;
  summary.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (cardWidth + 24);
    const cardY = y + row * 60;
    doc.setFillColor(234, 242, 255);
    doc.roundedRect(x, cardY, cardWidth, 46, 8, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 12, cardY + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(value, x + 12, cardY + 35);
  });

  y += 60 * Math.ceil(summary.length / 2) + 20;

  // Category breakdown — aggregated by category NAME (not id) so that any
  // leftover duplicate category records never split one category's total
  // across two rows.
  const categoryTotals = new Map<string, number>();
  for (const e of expenses) {
    const name = categories.find((c) => c.id === e.categoryId)?.name ?? 'Other';
    const key = name.trim().toLowerCase();
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + e.amount);
  }
  const displayName = (key: string) => categories.find((c) => c.name.trim().toLowerCase() === key)?.name ?? 'Other';
  const breakdownRows = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, total]) => {
      const pct = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
      return [displayName(key), formatINRForPDF(total), `${pct.toFixed(1)}%`];
    });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('CATEGORY BREAKDOWN', margin, y);
  y += 10;

  if (breakdownRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount', 'Percentage']],
      body: breakdownRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, textColor: INK, cellPadding: 6 },
      headStyles: { fillColor: BRAND_BLUE, textColor: 255 },
      alternateRowStyles: { fillColor: [247, 250, 255] },
    });
    // @ts-expect-error - lastAutoTable is added by the plugin at runtime
    y = doc.lastAutoTable.finalY + 24;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('No spending data yet.', margin, y + 14);
    y += 34;
  }

  // Expense history
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('EXPENSE HISTORY', margin, y);
  y += 10;

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Other';
  const historyRows = [...expenses]
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1))
    .map((e) => [formatDisplayDateLong(e.date), e.name, categoryName(e.categoryId), formatINRForPDF(e.amount), e.note ?? '']);

  if (historyRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Expense', 'Category', 'Amount', 'Notes']],
      body: historyRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, textColor: INK, cellPadding: 5 },
      headStyles: { fillColor: BRAND_BLUE, textColor: 255 },
      alternateRowStyles: { fillColor: [247, 250, 255] },
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('Nothing to report yet.', margin, y + 14);
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Generated by Spendly', pageWidth / 2, pageHeight - 24, { align: 'center' });
  }

  return doc;
}
