import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  Receipt,
  Download,
  Calendar,
  Sparkles,
  RefreshCw,
  Coins
} from 'lucide-react';
import { CurrencyCode, ActiveTab } from '../types';
import { CURRENCIES } from '../data/categories';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  todayExpenses: number;
  onOpenAddModal: () => void;
  onOpenReceiptScanner: () => void;
  onOpenExportModal: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currency,
  onCurrencyChange,
  totalIncome,
  totalExpenses,
  netBalance,
  todayExpenses,
  onOpenAddModal,
  onOpenReceiptScanner,
  onOpenExportModal,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'daily', label: 'سجل المصاريف', icon: Wallet },
    { id: 'budgets', label: 'الميزانيات والسقف', icon: TrendingDown },
    { id: 'analytics', label: 'التقارير والإحصائيات', icon: TrendingUp },
    { id: 'goals', label: 'أهداف الادخار', icon: Coins },
    { id: 'advisor', label: 'المستشار الذكي', icon: Sparkles, badge: 'AI' },
    { id: 'studio', label: 'استوديو الصور 4K', icon: Receipt, badge: 'PRO' },
  ];

  return (
    <header className="bg-[#121214]/95 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30 shadow-lg shadow-black/40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 ring-4 ring-emerald-950/60">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-zinc-100 tracking-tight">محاسب المصاريف اليومية</h1>
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  النسخة الذكية
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">إدارة سهلة للمصاريف والميزانيات مع مستشار مالي ذكي</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Scan Receipt Button */}
            <button
              onClick={onOpenReceiptScanner}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-800/60 transition-colors cursor-pointer"
              title="قراءة فاتورة بالذكاء الاصطناعي"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>فحص فاتورة</span>
            </button>

            {/* Export / Report */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-colors cursor-pointer"
              title="تصدير وطباعة التقرير"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>تصدير تقرير</span>
            </button>

            {/* Main Add Expense / Income Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-sm font-bold shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معاملة</span>
            </button>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-zinc-800/80">
          
          {/* Today's Expense */}
          <div className="bg-[#18181b]/80 rounded-xl p-2.5 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">مصاريف اليوم</span>
              <span className="text-sm font-black text-rose-400">
                {formatCurrency(todayExpenses, currency)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-950/70 text-rose-400 border border-rose-800/40 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          {/* Month Expenses */}
          <div className="bg-[#18181b]/80 rounded-xl p-2.5 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">إجمالي مصاريف الشهر</span>
              <span className="text-sm font-black text-zinc-100">
                {formatCurrency(totalExpenses, currency)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-orange-950/70 text-orange-400 border border-orange-800/40 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          {/* Month Income */}
          <div className="bg-[#18181b]/80 rounded-xl p-2.5 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">إجمالي الدخل</span>
              <span className="text-sm font-black text-emerald-400">
                {formatCurrency(totalIncome, currency)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-[#18181b]/80 rounded-xl p-2.5 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">الرصيد الصافي المتبقي</span>
              <span className={`text-sm font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netBalance, currency)}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-lg ${netBalance >= 0 ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/70 text-rose-400 border border-rose-800/40'} flex items-center justify-center font-bold text-xs`}>
              {netBalance >= 0 ? '✓' : '!'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#141417] border-t border-zinc-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700 ring-1 ring-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      tab.badge === 'PRO'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
