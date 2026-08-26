import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Award,
  Wallet
} from 'lucide-react';
import { Transaction, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { formatCurrency, formatArabicDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsDashboardProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  transactions,
  currency,
  onOpenAdvisorWithPrompt,
}) => {
  const [period, setPeriod] = useState<'current_month' | 'all_time'>('current_month');

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const filteredTransactions = transactions.filter((t) => {
    if (period === 'current_month') {
      return t.date.startsWith(currentYearMonth);
    }
    return true;
  });

  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');
  const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income');

  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category breakdown
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  expenseTransactions.forEach((tx) => {
    if (!categoryTotals[tx.categoryId]) {
      categoryTotals[tx.categoryId] = { amount: 0, count: 0 };
    }
    categoryTotals[tx.categoryId].amount += tx.amount;
    categoryTotals[tx.categoryId].count += 1;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, data]) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId) || {
        nameAr: 'أخرى',
        icon: 'Layers',
        color: '#78716c',
        bgLight: '',
      };
      const percent = totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0;
      return {
        catId,
        name: cat.nameAr,
        icon: cat.icon,
        color: cat.color,
        amount: data.amount,
        count: data.count,
        percent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Daily Spending Trend (Last 7 days)
  const last7Days: { dateStr: string; label: string; expense: number; income: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayExp = transactions
      .filter((t) => t.type === 'expense' && t.date === dateStr)
      .reduce((acc, t) => acc + t.amount, 0);
    const dayInc = transactions
      .filter((t) => t.type === 'income' && t.date === dateStr)
      .reduce((acc, t) => acc + t.amount, 0);

    last7Days.push({
      dateStr,
      label: formatArabicDate(dateStr),
      expense: dayExp,
      income: dayInc,
    });
  }

  const maxDayExpense = Math.max(10, ...last7Days.map((d) => d.expense));

  // Payment method breakdown
  const paymentTotals: Record<string, number> = {};
  expenseTransactions.forEach((tx) => {
    paymentTotals[tx.paymentMethod] = (paymentTotals[tx.paymentMethod] || 0) + tx.amount;
  });

  // Top 5 largest single expenses
  const topExpenses = [...expenseTransactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Header Filter */}
      <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-100">التقارير المحاسبية والإحصائيات</h2>
          <p className="text-xs text-zinc-400">تحليل مرئي دقيق لتوزيع السيولة وتدفق المصاريف</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setPeriod('current_month')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'current_month'
                ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            هذا الشهر الحالي
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'all_time'
                ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            كل المعاملات السابقة
          </button>
        </div>
      </div>

      {/* KPI 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">إجمالي المصاريف</span>
          <span className="text-xl font-black text-rose-400">
            {formatCurrency(totalExpenses, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 font-semibold block">
            {expenseTransactions.length} عملية شراء وصرف
          </span>
        </div>

        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">إجمالي الإيرادات</span>
          <span className="text-xl font-black text-emerald-400">
            {formatCurrency(totalIncome, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 font-semibold block">
            {incomeTransactions.length} إيداعات ودخل
          </span>
        </div>

        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">الوفورات الصافية</span>
          <span
            className={`text-xl font-black ${
              netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netSavings, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 font-semibold block">
            {netSavings >= 0 ? 'فائض مالي إيجابي' : 'عجز في الميزانية'}
          </span>
        </div>

        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">معدل الادخار الفعلي</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-indigo-400">{savingsRate}%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-800/50 font-bold">
              {savingsRate >= 20 ? 'ممتاز ★' : 'يحتاج ترشيد'}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-semibold block">من إجمالي الدخل المكتسب</span>
        </div>
      </div>

      {/* Main Charts Row: Category Breakdown & 7-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-[#121214] rounded-2xl p-5 border border-zinc-800/80 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">توزيع المصاريف حسب الفئات</h3>
              </div>
              <button
                onClick={() =>
                  onOpenAdvisorWithPrompt(
                    'قم بتحليل توزيع مصاريفي حسب الفئات وأخبرني بأي فئة استهلكت النصيب الأكبر وكيف أخفضها.'
                  )
                }
                className="text-purple-400 hover:text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحليل الذكاء الاصطناعي</span>
              </button>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                لا توجد مصاريف لتحليلها في هذه الفترة
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {sortedCategories.map((item) => (
                  <div key={item.catId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                          style={{ backgroundColor: item.color }}
                        >
                          <CategoryIcon name={item.icon} className="w-3 h-3" />
                        </div>
                        <span className="text-zinc-200">{item.name}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          ({item.count} عمليات)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-100">{formatCurrency(item.amount, currency)}</span>
                        <span className="text-zinc-400 w-8 text-left font-black">{item.percent}%</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/40">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Spending Trend Bar Chart */}
        <div className="bg-[#121214] rounded-2xl p-5 border border-zinc-800/80 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">حركة المصاريف لآخر 7 أيام</h3>
              </div>
              <span className="text-xs text-zinc-400 font-semibold">معدل الصرف اليومي</span>
            </div>

            <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2">
              {last7Days.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.expense / maxDayExpense) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-black text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.expense}
                    </div>

                    <div className="w-full max-w-[36px] bg-zinc-900/90 border border-zinc-800/80 rounded-xl flex flex-col justify-end p-1 h-36">
                      <div
                        className="w-full bg-rose-500 hover:bg-rose-400 rounded-lg transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <div className="text-center">
                      <span className="text-[11px] font-bold text-zinc-300 block line-clamp-1">
                        {day.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>الأعمدة تمثل حجم المصروف اليومي</span>
            <span className="text-emerald-400 font-bold">تتبع سلوكك المالي بانتظام</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Payment Methods & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-[#121214] rounded-2xl p-5 border border-zinc-800/80 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">توزيع الصرف حسب وسيلة الدفع</h3>
          </div>

          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((pm) => {
              const amount = paymentTotals[pm.id] || 0;
              const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
              return (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/80 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{pm.nameAr}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-zinc-100">
                      {formatCurrency(amount, currency)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-black">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Single Expenses */}
        <div className="bg-[#121214] rounded-2xl p-5 border border-zinc-800/80 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">أعلى 5 مصاريف مسجلة</h3>
            </div>
            <span className="text-xs text-zinc-400 font-semibold">المشتريات الكبرى</span>
          </div>

          <div className="space-y-2">
            {topExpenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">لا توجد مصاريف كافية</div>
            ) : (
              topExpenses.map((tx, i) => {
                const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/80 border border-zinc-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-950/70 border border-amber-800/50 text-amber-400 text-[11px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-zinc-100 block">
                          {tx.merchant || cat?.nameAr || 'مصروف'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          {formatArabicDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-rose-400">
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
