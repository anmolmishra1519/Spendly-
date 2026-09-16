const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrFormatterDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/** Formats a number as INR using Indian digit grouping, e.g. ₹1,25,000 */
export function formatINR(amount: number, withDecimals = false): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return (withDecimals ? inrFormatterDecimals : inrFormatter).format(value);
}

/** Formats signed amounts for transaction lists, e.g. -₹180 */
export function formatSignedINR(amount: number): string {
  const formatted = formatINR(Math.abs(amount));
  return amount < 0 ? `-${formatted}` : formatted;
}

const inrPlainGroupingFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/**
 * jsPDF's built-in fonts (Helvetica/Times/Courier) don't include a glyph
 * for ₹, so drawing it renders as a broken/garbled character in exported
 * PDFs. This formatter uses the plain-ASCII "Rs." prefix instead, with the
 * same Indian digit grouping, so PDF output stays clean and readable.
 */
export function formatINRForPDF(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${inrPlainGroupingFormatter.format(value)}`;
}

export function parseAmountInput(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return value;
}
