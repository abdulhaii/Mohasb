import { CurrencyCode, Transaction } from '../types';

export function formatCurrency(amount: number, _currencyCode?: CurrencyCode): string {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formattedNumber;
}

export function formatNumberOnly(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays === -1) return 'غداً';

  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function formatArabicMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['المعرف', 'النوع', 'المبلغ', 'الفئة', 'التاريخ', 'الوقت', 'طريقة الدفع', 'المتجر / الجهة', 'ملاحظات'];
  const rows = transactions.map((t) => [
    t.id,
    t.type === 'expense' ? 'مصروف' : 'دخل',
    t.amount,
    t.categoryId,
    t.date,
    t.time || '',
    t.paymentMethod,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csvContent;
}
