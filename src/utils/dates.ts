import { format, parseISO } from 'date-fns';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatDisplayDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'd MMM');
  } catch {
    return isoDate;
  }
}

export function formatDisplayDateLong(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'd MMMM yyyy');
  } catch {
    return isoDate;
  }
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function monthKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function dateBelongsToMonth(isoDate: string, month: number, year: number): boolean {
  const d = parseISO(isoDate);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}
