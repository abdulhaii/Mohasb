import React, { useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  SavingGoal,
  ChatMessage,
  GeneratedVisual,
  CurrencyCode,
  ActiveTab
} from './types';
import { Storage } from './utils/storage';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { BudgetPlanner } from './components/BudgetPlanner';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FinancialAdvisorChat } from './components/FinancialAdvisorChat';
import { SavingGoalsTracker } from './components/SavingGoalsTracker';
import { FinancialImageStudio } from './components/FinancialImageStudio';
import { QuickAddModal } from './components/QuickAddModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { ExportModal } from './components/ExportModal';
import { QUICK_PRESETS, DEFAULT_CATEGORIES } from './data/categories';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [visuals, setVisuals] = useState<GeneratedVisual[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('SAR');
  const [currentTab, setCurrentTab] = useState<ActiveTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction> | null>(
    null
  );
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string | null>(null);

  // Load from storage on mount
  const loadAllData = () => {
    setTransactions(Storage.getTransactions());
    setBudgets(Storage.getBudgets());
    setGoals(Storage.getGoals());
    setChatMessages(Storage.getChatMessages());
    setVisuals(Storage.getVisuals());
    setCurrency(Storage.getCurrency());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Summary Calculations
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentYearMonth)
  );

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date === todayStr)
    .reduce((acc, t) => acc + t.amount, 0);

  // Transactions Handlers
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    let updated: Transaction[];
    if (editingTransaction && editingTransaction.id) {
      // Edit existing
      updated = transactions.map((t) =>
        t.id === editingTransaction.id
          ? {
              ...t,
              ...txData,
            }
          : t
      );
    } else {
      // Add new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: Date.now(),
      };
      updated = [newTx, ...transactions];
    }

    setTransactions(updated);
    Storage.saveTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    Storage.saveTransactions(updated);
  };

  const handleQuickPresetAdd = (preset: (typeof QUICK_PRESETS)[0]) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'expense',
      amount: preset.amount,
      categoryId: preset.categoryId,
      date: selectedDate || todayStr,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: preset.paymentMethod as any,
      merchant: preset.title,
      notes: `تسجيل سريع: ${preset.title}`,
      createdAt: Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    Storage.saveTransactions(updated);
  };

  // Budgets Handlers
  const handleSaveBudget = (budget: Budget) => {
    const existingIndex = budgets.findIndex((b) => b.categoryId === budget.categoryId);
    let updated: Budget[];
    if (existingIndex >= 0) {
      updated = [...budgets];
      updated[existingIndex] = budget;
    } else {
      updated = [...budgets, budget];
    }
    setBudgets(updated);
    Storage.saveBudgets(updated);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    Storage.saveBudgets(updated);
  };

  // Goals Handlers
  const handleSaveGoal = (goal: SavingGoal) => {
    const existingIndex = goals.findIndex((g) => g.id === goal.id);
    let updated: SavingGoal[];
    if (existingIndex >= 0) {
      updated = [...goals];
      updated[existingIndex] = goal;
    } else {
      updated = [...goals, goal];
    }
    setGoals(updated);
    Storage.saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    Storage.saveGoals(updated);
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    const updated = goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    );
    setGoals(updated);
    Storage.saveGoals(updated);
  };

  // Visuals Handlers
  const handleSaveVisual = (visual: GeneratedVisual) => {
    const updated = [visual, ...visuals];
    setVisuals(updated);
    Storage.saveVisuals(updated);
  };

  const handleDeleteVisual = (id: string) => {
    const updated = visuals.filter((v) => v.id !== id);
    setVisuals(updated);
    Storage.saveVisuals(updated);
  };

  // Currency change
  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    Storage.saveCurrency(newCurr);
  };

  // AI Chat Handler
  const handleSendChatMessage = async (
    userText: string,
    model: string,
    systemRole: string
  ) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const updatedWithUser = [...chatMessages, userMsg];
    setChatMessages(updatedWithUser);
    Storage.saveChatMessages(updatedWithUser);

    // Compute category breakdown for context
    const categoryBreakdown: Record<string, number> = {};
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId);
        const name = cat?.nameAr || tx.categoryId;
        categoryBreakdown[name] = (categoryBreakdown[name] || 0) + tx.amount;
      });

    const totalBudgetObj = budgets.find((b) => b.categoryId === 'all');

    const financialContext = {
      currency,
      totalIncome,
      totalExpenses,
      netBalance,
      transactionCount: transactions.length,
      monthlyBudget: totalBudgetObj?.amount || 0,
      categoriesBreakdown: categoryBreakdown,
    };

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: systemRole,
          model,
          financialContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالمستشار المالي.');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        model: data.model,
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      setChatMessages(finalMessages);
      Storage.saveChatMessages(finalMessages);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `عذراً، حدث خطأ أثناء الاتصال: ${err?.message || 'يرجى المحاولة مرة أخرى.'}`,
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedWithUser, errorMsg];
      setChatMessages(finalMessages);
      Storage.saveChatMessages(finalMessages);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('هل تريد مسح سجل المحادثة والبدء من جديد؟')) {
      const initial: ChatMessage[] = [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content:
            'مرحباً بك! أنا مستشارك المالي الذكي. لقد تم مسح السجل السابق، كيف يمكنني مساعدتك في إدارة مصاريفك وتوفير أموالك اليوم؟',
          timestamp: Date.now(),
        },
      ];
      setChatMessages(initial);
      Storage.saveChatMessages(initial);
    }
  };

  const handleOpenAdvisorWithPrompt = (promptText: string) => {
    setAdvisorInitialPrompt(promptText);
    setCurrentTab('advisor');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
        todayExpenses={todayExpenses}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetData={loadAllData}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'daily' && (
          <DailyView
            transactions={transactions}
            currency={currency}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenAddModal={(initial) => {
              setEditingTransaction(initial || null);
              setIsAddModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onQuickPresetAdd={handleQuickPresetAdd}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetPlanner
            budgets={budgets}
            transactions={transactions}
            currency={currency}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            transactions={transactions}
            currency={currency}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {currentTab === 'goals' && (
          <SavingGoalsTracker
            goals={goals}
            currency={currency}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {currentTab === 'advisor' && (
          <FinancialAdvisorChat
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            onClearChat={handleClearChat}
            transactions={transactions}
            budgets={budgets}
            currency={currency}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netBalance={netBalance}
            initialPrompt={advisorInitialPrompt}
            onClearInitialPrompt={() => setAdvisorInitialPrompt(null)}
          />
        )}

        {currentTab === 'studio' && (
          <FinancialImageStudio
            visuals={visuals}
            onSaveVisual={handleSaveVisual}
            onDeleteVisual={handleDeleteVisual}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#121214] border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-zinc-300">محاسب المصاريف اليومية الذكي © {new Date().getFullYear()} - جميع الحقوق محفوظة</span>
          <span className="text-[11px] text-zinc-500">
            مدعوم بتقنيات الذكاء الاصطناعي Gemini 3.5 Flash & Gemini 3 Pro
          </span>
        </div>
      </footer>

      {/* Quick Add / Edit Transaction Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        currency={currency}
        initialData={editingTransaction}
      />

      {/* AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onApplyParsedExpense={(parsedData) => {
          setEditingTransaction(parsedData);
          setIsAddModalOpen(true);
        }}
        currency={currency}
      />

      {/* Export / Print Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currency={currency}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
        onDataReload={loadAllData}
      />
    </div>
  );
}
