import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Logo } from '@/components/Logo';
import { currentMonthYear, MONTH_NAMES } from '@/utils/dates';
import { parseAmountInput } from '@/utils/currency';

type Step = 'welcome' | 'name' | 'month';

export function Onboarding() {
  const createMonth = useAppStore((s) => s.createMonth);
  const months = useAppStore((s) => s.months);
  const userName = useAppStore((s) => s.settings.userName);
  const setUserName = useAppStore((s) => s.setUserName);

  const isFirstMonthEver = months.length === 0;
  const [step, setStep] = useState<Step>(isFirstMonthEver ? 'welcome' : 'month');

  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const { month: defaultMonth, year: defaultYear } = currentMonthYear();
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const years = [defaultYear - 1, defaultYear, defaultYear + 1];

  function handleGetStarted() {
    setStep(userName ? 'month' : 'name');
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Tell us what to call you.');
      return;
    }
    setNameError(null);
    await setUserName(trimmed);
    setStep('month');
  }

  async function handleMonthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = parseAmountInput(budget);
    if (!amount || amount <= 0) {
      setError('Enter a monthly budget greater than ₹0.');
      return;
    }
    setSubmitting(true);
    try {
      await createMonth(month, year, amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'welcome') {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg dark:bg-bg-dark px-6 text-center">
        <div className="animate-fade-in-up">
          <div className="mx-auto mb-8">
            <Logo size={56} withWordmark={false} />
          </div>
          <h1 className="max-w-sm text-[28px] font-extrabold leading-tight tracking-tight text-ink dark:text-ink-dark md:text-4xl">
            Take control of your money.
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-[15px] text-muted dark:text-muted-dark md:max-w-sm">
            Track your daily spending, understand your habits, and stay within your monthly budget.
          </p>
          <button
            onClick={handleGetStarted}
            className="mt-8 w-full max-w-xs rounded-control bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:opacity-95 active:scale-[0.98] sm:w-auto"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg dark:bg-bg-dark px-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-6 flex justify-center">
            <Logo size={40} withWordmark={false} />
          </div>
          <h2 className="text-center text-xl font-bold text-ink dark:text-ink-dark">What should we call you?</h2>
          <p className="mt-1.5 text-center text-sm text-muted dark:text-muted-dark">
            We'll use this to personalize your dashboard.
          </p>

          <form
            onSubmit={handleNameSubmit}
            className="mt-7 space-y-4 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-soft"
          >
            <div>
              <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Your Name
              </label>
              <input
                id="user-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Aarav"
                autoFocus
                autoComplete="given-name"
                className="w-full rounded-control border border-border dark:border-border-dark bg-transparent px-3.5 py-2.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
              />
            </div>

            {nameError && (
              <p role="alert" className="rounded-control bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
                {nameError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-control bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg dark:bg-bg-dark px-6 py-8">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-6 flex justify-center">
          <Logo size={40} withWordmark={false} />
        </div>
        <h2 className="text-center text-xl font-bold text-ink dark:text-ink-dark">
          {isFirstMonthEver ? `Create your first month${userName ? `, ${userName}` : ''}` : 'Create a new month'}
        </h2>
        <p className="mt-1.5 text-center text-sm text-muted dark:text-muted-dark">
          Set a budget to start tracking your spending.
        </p>

        <form
          onSubmit={handleMonthSubmit}
          className="mt-7 space-y-4 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-soft"
        >
          <div>
            <label htmlFor="select-month" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
              Select Month
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                id="select-month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-control border border-border dark:border-border-dark bg-transparent px-3 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-control border border-border dark:border-border-dark bg-transparent px-3 py-2.5 text-sm text-ink dark:text-ink-dark focus:border-brand"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="budget-input" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
              Monthly Budget
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                id="budget-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="Enter amount"
                autoFocus
                className="w-full rounded-control border border-border dark:border-border-dark bg-transparent py-2.5 pl-7 pr-3.5 text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-brand"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-control bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-control bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            Start Tracking
          </button>
        </form>
      </div>
    </div>
  );
}
