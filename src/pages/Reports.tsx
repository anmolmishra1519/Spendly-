import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { monthService } from '@/services/monthService';
import { expenseService } from '@/services/expenseService';
import { reportService } from '@/services/reportService';
import { formatINR } from '@/utils/currency';
import { monthLabel } from '@/utils/dates';
import { sumExpenses } from '@/utils/calculations';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon, FileText, Download, Printer, Upload } from '@/components/icons';
import type { ExpenseRecord, MonthRecord } from '@/types';

export function Reports() {
  const months = useAppStore((s) => s.months);
  const categories = useAppStore((s) => s.categories);
  const selectedMonthId = useAppStore((s) => s.selectedMonthId);
  const showToast = useAppStore((s) => s.showToast);

  const [reportMonthId, setReportMonthId] = useState(selectedMonthId ?? '');
  const [reportMonth, setReportMonth] = useState<MonthRecord | null>(null);
  const [reportExpenses, setReportExpenses] = useState<ExpenseRecord[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!reportMonthId && months.length > 0) setReportMonthId(months[0].id);
  }, [months, reportMonthId]);

  useEffect(() => {
    if (!reportMonthId) return;
    (async () => {
      const m = await monthService.getMonth(reportMonthId);
      const e = m ? await expenseService.getByMonth(m.id) : [];
      setReportMonth(m ?? null);
      setReportExpenses(e);
    })();
  }, [reportMonthId]);

  if (months.length === 0) return null;

  const totalSpent = sumExpenses(reportExpenses);
  const available = reportMonth ? reportMonth.budget - totalSpent : 0;
  const hasExpenses = reportExpenses.length > 0;

  const categoryTotals = new Map<string, { total: number; count: number }>();
  for (const e of reportExpenses) {
    const entry = categoryTotals.get(e.categoryId) ?? { total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    categoryTotals.set(e.categoryId, entry);
  }

  async function withReport(action: (m: MonthRecord) => void, label: string) {
    if (!reportMonth) return;
    setGenerating(label);
    try {
      action(reportMonth);
    } catch {
      showToast('Something went wrong generating the report.', 'error');
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink dark:text-ink-dark">Monthly Reports</h2>
          <p className="text-sm text-muted dark:text-muted-dark">Generate a full report of any month you've tracked.</p>
        </div>
        <select
          value={reportMonthId}
          onChange={(e) => setReportMonthId(e.target.value)}
          className="rounded-control border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm font-medium text-ink dark:text-ink-dark focus:border-brand"
        >
          {months.map((m) => (
            <option key={m.id} value={m.id}>
              {monthLabel(m.month, m.year)}
            </option>
          ))}
        </select>
      </div>

      {reportMonth && (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={!!generating}
              onClick={() => withReport((m) => reportService.downloadPDF(m, reportExpenses, categories), 'pdf')}
              className="flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {generating === 'pdf' ? 'Preparing…' : 'Download PDF'}
            </button>
            <button
              disabled={!!generating}
              onClick={() => withReport((m) => reportService.printPDF(m, reportExpenses, categories), 'print')}
              className="flex items-center gap-2 rounded-control border border-border dark:border-border-dark px-4 py-2.5 text-sm font-semibold text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5 disabled:opacity-60"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              disabled={!!generating}
              onClick={() => withReport((m) => reportService.exportCSV(m, reportExpenses, categories), 'csv')}
              className="flex items-center gap-2 rounded-control border border-border dark:border-border-dark px-4 py-2.5 text-sm font-semibold text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-white/5 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" /> Export CSV
            </button>
          </div>

          <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-soft">
            <div className="flex items-center justify-between border-b border-border dark:border-border-dark pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Spendly</p>
                <h3 className="text-base font-bold text-ink dark:text-ink-dark">{monthLabel(reportMonth.month, reportMonth.year)} Report</h3>
              </div>
              <FileText className="h-6 w-6 text-brand" />
            </div>

            {!hasExpenses ? (
              <EmptyState title="Nothing to report yet." description="This month has no expenses recorded." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 py-5 sm:grid-cols-4">
                  {[
                    ['Monthly Budget', formatINR(reportMonth.budget)],
                    ['Total Spent', formatINR(totalSpent)],
                    ['Available', available < 0 ? `-${formatINR(Math.abs(available))}` : formatINR(available)],
                    ['Transactions', String(reportExpenses.length)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-medium text-muted dark:text-muted-dark">{label}</p>
                      <p className="mt-1 text-sm font-bold text-ink dark:text-ink-dark">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border dark:border-border-dark pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Category breakdown</p>
                  <ul className="space-y-2">
                    {[...categoryTotals.entries()]
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([categoryId, { total }]) => {
                        const category = categories.find((c) => c.id === categoryId);
                        const pct = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                        return (
                          <li key={categoryId} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-ink dark:text-ink-dark">
                              <CategoryIcon icon={category?.icon ?? 'more-horizontal'} className="h-4 w-4" />
                              {category?.name ?? 'Other'}
                            </span>
                            <span className="text-muted">{formatINR(total)} · {pct.toFixed(1)}%</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
