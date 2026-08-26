import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  Car,
  Utensils,
  ShoppingCart,
  Filter,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Transaction, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES, QUICK_PRESETS } from '../data/categories';
import { formatCurrency, formatArabicDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DailyViewProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAddModal: (initial?: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onQuickPresetAdd: (preset: (typeof QUICK_PRESETS)[0]) => void;
  onOpenReceiptScanner: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  transactions,
  currency,
  selectedDate,
  onSelectDate,
  onOpenAddModal,
  onDeleteTransaction,
  onQuickPresetAdd,
  onOpenReceiptScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Navigate Date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onSelectDate(new Date().toISOString().split('T')[0]);
  };

  // Filter transactions for this date
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);

  // Filtered by search & category
  const filteredTransactions = dayTransactions.filter((t) => {
    const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === t.categoryId);
    const matchesSearch =
      !searchQuery ||
      (t.merchant && t.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cat && cat.nameAr.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const dayExpenses = dayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const dayIncome = dayTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      
      {/* Date Navigator Bar */}
      <div className="bg-[#121214] rounded-2xl p-3 sm:p-4 border border-zinc-800/80 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Navigation Arrows & Date Display */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 transition-colors cursor-pointer"
            title="اليوم السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm font-bold text-zinc-100">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{formatArabicDate(selectedDate)}</span>
              <span className="text-xs text-zinc-400 font-medium">({selectedDate})</span>
            </div>

            {!isToday && (
              <button
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 text-xs font-bold border border-emerald-800/60 transition-colors cursor-pointer"
              >
                العودة لليوم
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 transition-colors cursor-pointer"
            title="اليوم التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Date Picker Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Day's Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-400 block mb-0.5">مصاريف هذا اليوم</span>
            <span className="text-xl font-black text-rose-400">
              {formatCurrency(dayExpenses, currency)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/70 text-rose-400 border border-rose-800/40 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-400 block mb-0.5">دخل هذا اليوم</span>
            <span className="text-xl font-black text-emerald-400">
              {formatCurrency(dayIncome, currency)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-400 block mb-0.5">صافي حركة اليوم</span>
            <span
              className={`text-xl font-black ${
                dayIncome - dayExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(dayIncome - dayExpenses, currency)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center justify-center font-bold text-xs">
            {dayTransactions.length} معامَلة
          </div>
        </div>
      </div>

      {/* 1-Click Fast Presets Strip (Rapid Daily Logging) */}
      <div className="bg-gradient-to-r from-emerald-950/40 to-zinc-900 rounded-2xl p-4 border border-emerald-800/40">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-emerald-200">تسجيل سريع بضغطة زر (المصاريف المتكررة)</h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">توفير الوقت والجهد</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onQuickPresetAdd(preset)}
              className="flex items-center justify-between p-2 rounded-xl bg-[#18181b] hover:bg-emerald-600 hover:text-white border border-zinc-800 hover:border-emerald-500 text-zinc-200 text-xs font-bold transition-all shadow-xs group cursor-pointer active:scale-95"
            >
              <span className="truncate">{preset.title}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 group-hover:bg-emerald-700 text-emerald-300 group-hover:text-white border border-emerald-800/60 font-black">
                {preset.amount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Category Filter Header */}
      <div className="bg-[#121214] rounded-2xl p-4 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث في المتجر، الفئة، الملاحظات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-hidden cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
            >
              <option value="all">كل الفئات والتصنيفات</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>

            <button
              onClick={() => onOpenAddModal({ date: selectedDate })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة لهذا اليوم</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40">
              <Receipt className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-300">لا توجد مصاريف أو معاملات مسجلة في هذا اليوم</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                يمكنك الضغط على زر "إضافة معاملة" أو استخدام الأزرار السريعة بالأعلى لتسجيل مصاريفك فوراً.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => onOpenAddModal({ date: selectedDate })}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل مصروف الآن</span>
                </button>
                <button
                  onClick={onOpenReceiptScanner}
                  className="px-4 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>فحص فاتورة بالكاميرا</span>
                </button>
              </div>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId) || {
                nameAr: 'غير مصنف',
                icon: 'Layers',
                color: '#71717a',
                bgLight: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
              };

              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="bg-[#18181b]/80 hover:bg-zinc-800/80 rounded-xl p-3.5 border border-zinc-800/80 hover:border-zinc-700 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-100">
                          {tx.merchant || cat.nameAr}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.bgLight}`}
                        >
                          {cat.nameAr}
                        </span>
                        {tx.time && (
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {tx.time}
                          </span>
                        )}
                        {tx.receiptImage && (
                          <button
                            onClick={() => setViewingReceiptUrl(tx.receiptImage || null)}
                            className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/60 px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3 h-3 text-purple-400" />
                            <span>مرفق فاتورة</span>
                          </button>
                        )}
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{tx.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                    <div className="text-right">
                      <span
                        className={`text-base font-black tracking-tight ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'} {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenAddModal(tx)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/80 transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Receipt Image Viewer Modal */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>صورة الفاتورة المرفقة</span>
              </h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
            <div className="mt-3 max-h-[70vh] overflow-auto flex items-center justify-center bg-zinc-950 rounded-xl p-2 border border-zinc-800/80">
              <img
                src={viewingReceiptUrl}
                alt="Receipt Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
