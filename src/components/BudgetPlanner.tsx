import React, { useState } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit3,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Budget, Transaction, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetPlannerProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: CurrencyCode;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budgets,
  transactions,
  currency,
  onSaveBudget,
  onDeleteBudget,
  onOpenAdvisorWithPrompt,
}) => {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [budgetAmount, setBudgetAmount] = useState<string>('');

  // Calculate current month's expenses
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentYearMonth)
  );

  const totalMonthExpense = currentMonthExpenses.reduce((acc, t) => acc + t.amount, 0);

  // Total overall monthly budget
  const totalBudgetObj = budgets.find((b) => b.categoryId === 'all') || {
    id: 'b-total',
    categoryId: 'all',
    amount: 8000,
    period: 'monthly',
  };

  const totalBudgetAmount = totalBudgetObj.amount;
  const totalBudgetSpent = totalMonthExpense;
  const totalBudgetRemaining = Math.max(0, totalBudgetAmount - totalBudgetSpent);
  const totalBudgetPercent = Math.min(100, Math.round((totalBudgetSpent / (totalBudgetAmount || 1)) * 100));

  const daysRemaining = getDaysRemainingInMonth();
  const dailyAllowance = Math.max(0, totalBudgetRemaining / daysRemaining);

  const handleOpenEdit = (b?: Budget) => {
    if (b) {
      setEditingBudget(b);
      setSelectedCategory(b.categoryId);
      setBudgetAmount(String(b.amount));
    } else {
      setEditingBudget(null);
      setSelectedCategory('food');
      setBudgetAmount('1000');
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(budgetAmount);
    if (!amountNum || amountNum <= 0) return;

    onSaveBudget({
      id: editingBudget ? editingBudget.id : `b-${Date.now()}`,
      categoryId: selectedCategory,
      amount: amountNum,
      period: 'monthly',
    });

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Master Budget & Daily Allowance */}
      <div className="bg-gradient-to-br from-[#121214] via-zinc-900 to-emerald-950/60 rounded-3xl p-6 text-white border border-zinc-800/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Main Stats */}
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-800/60">
                الميزانية الشهرية العامة
              </span>
              <button
                onClick={() => handleOpenEdit(totalBudgetObj)}
                className="text-zinc-400 hover:text-zinc-200 text-xs font-bold flex items-center gap-1 underline cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل السقف</span>
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
                {formatCurrency(totalBudgetSpent, currency)}
              </h2>
              <span className="text-zinc-400 text-sm font-semibold">
                من أصل {formatCurrency(totalBudgetAmount, currency)}
              </span>
            </div>

            {/* Master Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalBudgetPercent >= 90
                      ? 'bg-rose-500'
                      : totalBudgetPercent >= 70
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${totalBudgetPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>تم استهلاك {totalBudgetPercent}%</span>
                <span>المتبقي: {formatCurrency(totalBudgetRemaining, currency)}</span>
              </div>
            </div>
          </div>

          {/* Daily Allowance Card */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/60 md:w-64 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
              <span>المصروف اليومي المسموح</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(dailyAllowance, currency)}
              <span className="text-xs text-zinc-400 font-normal block">لكل يوم ({daysRemaining} يوم متبقي)</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              إذا حافظت على هذا المعدل يومياً، فلن تتجاوز سقف ميزانيتك لنهاية الشهر.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar & AI Advice Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-100">سقف الميزانيات حسب الفئات</h3>
          <p className="text-xs text-zinc-400">حدد ميزانية دقيقة لكل فئة لتجنب الإسراف</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              onOpenAdvisorWithPrompt(
                `بناءً على ميزانياتي ومصاريفي الحالية (المصروف: ${totalBudgetSpent} من ${totalBudgetAmount})، ما هي أفضل خطة لتوفير 20% هذا الشهر بدون التأثير على الأساسيات؟`
              )
            }
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-800/60 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>نصيحة الميزانية بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => handleOpenEdit()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سقف لفئة</span>
          </button>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets
          .filter((b) => b.categoryId !== 'all')
          .map((budget) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === budget.categoryId) || {
              nameAr: 'فئة غير معروفة',
              icon: 'Layers',
              color: '#71717a',
              bgLight: 'bg-zinc-800 text-zinc-300',
            };

            const spent = currentMonthExpenses
              .filter((t) => t.categoryId === budget.categoryId)
              .reduce((acc, t) => acc + t.amount, 0);

            const percent = Math.min(100, Math.round((spent / (budget.amount || 1)) * 100));
            const remaining = budget.amount - spent;
            const isOver = spent > budget.amount;

            return (
              <div
                key={budget.id}
                className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100">{cat.nameAr}</h4>
                        <span className="text-[11px] text-zinc-400 font-medium">ميزانية شهرية</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(budget)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Spending Numbers */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold block">المصروف</span>
                      <span className="text-base font-black text-zinc-100">
                        {formatCurrency(spent, currency)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-zinc-400 font-semibold block">السقف المخصص</span>
                      <span className="text-xs font-bold text-zinc-300">
                        {formatCurrency(budget.amount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2 border border-zinc-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : percent >= 80
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Footer status pill */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-bold">
                  <span className="text-zinc-400">استهلاك {percent}%</span>
                  {isOver ? (
                    <span className="text-rose-400 flex items-center gap-1 font-black">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>تجاوزت بـ {formatCurrency(Math.abs(remaining), currency)}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>متبقي {formatCurrency(remaining, currency)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Edit / Add Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-1">
              {editingBudget ? 'تعديل سقف الميزانية' : 'إضافة سقف ميزانية جديد'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">حدد السقف الشهري الذي لا ترغب بتجاوزه</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">اختر الفئة</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 focus:outline-hidden focus:border-emerald-500 [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
                >
                  <option value="all">الميزانية العامة الإجمالية للشهر</option>
                  {DEFAULT_CATEGORIES.filter((c) => c.type === 'expense').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  المبلغ الشهري
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="مثال: 1500"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-black text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  حفظ السقف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
