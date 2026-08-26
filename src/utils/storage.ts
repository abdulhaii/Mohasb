import { Transaction, Budget, SavingGoal, ChatMessage, GeneratedVisual, CurrencyCode } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smart_accountant_transactions_v2',
  BUDGETS: 'smart_accountant_budgets_v2',
  GOALS: 'smart_accountant_goals_v2',
  CHAT_MESSAGES: 'smart_accountant_chat_v2',
  VISUALS: 'smart_accountant_visuals_v2',
  CURRENCY: 'smart_accountant_currency_v2',
};

// Generate realistic default transactions for current month
export function getInitialTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();

  const padDay = (d: number) => String(Math.max(1, Math.min(28, d))).padStart(2, '0');

  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 14500,
      categoryId: 'salary',
      date: `${year}-${month}-01`,
      time: '09:00',
      paymentMethod: 'transfer',
      merchant: 'الشركة - إيداع الراتب',
      notes: 'راتب شهر ' + (now.getMonth() + 1),
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 3200,
      categoryId: 'housing',
      date: `${year}-${month}-02`,
      time: '11:30',
      paymentMethod: 'transfer',
      merchant: 'سداد دفعة الإيجار',
      notes: 'سداد إيجار السكن الشهري',
      createdAt: Date.now() - 86400000 * 19,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 450,
      categoryId: 'groceries',
      date: `${year}-${month}-${padDay(day - 5)}`,
      time: '18:45',
      paymentMethod: 'card',
      merchant: 'سوبرماركت التميمي',
      notes: 'مقاضي الأسبوع الأساسية وخضار',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 120,
      categoryId: 'transport',
      date: `${year}-${month}-${padDay(day - 4)}`,
      time: '14:20',
      paymentMethod: 'card',
      merchant: 'محطة الدريس',
      notes: 'تعبئة بنزين 91',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 185,
      categoryId: 'food',
      date: `${year}-${month}-${padDay(day - 3)}`,
      time: '20:15',
      paymentMethod: 'apple_pay',
      merchant: 'مطعم الشرفة',
      notes: 'عشاء مع العائلة',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 24,
      categoryId: 'cafe',
      date: `${year}-${month}-${padDay(day - 2)}`,
      time: '08:30',
      paymentMethod: 'apple_pay',
      merchant: 'بارن كافيه',
      notes: 'سبانش لاتيه بارد',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 310,
      categoryId: 'bills',
      date: `${year}-${month}-${padDay(day - 2)}`,
      time: '12:00',
      paymentMethod: 'card',
      merchant: 'فاتورة الاتصالات والإنترنت',
      notes: 'باقة الألياف المنزلية 5G',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-8',
      type: 'income',
      amount: 1800,
      categoryId: 'freelance',
      date: `${year}-${month}-${padDay(day - 1)}`,
      time: '16:00',
      paymentMethod: 'transfer',
      merchant: 'مشروع تصميم واجهات',
      notes: 'دفعة مستحقات العمل الحر',
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'tx-9',
      type: 'expense',
      amount: 65,
      categoryId: 'food',
      date: `${year}-${month}-${padDay(day)}`,
      time: '13:30',
      paymentMethod: 'apple_pay',
      merchant: 'مطعم صحي',
      notes: 'وجبة دايت صحية',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 22,
      categoryId: 'cafe',
      date: `${year}-${month}-${padDay(day)}`,
      time: '08:45',
      paymentMethod: 'apple_pay',
      merchant: 'مقهى خطوة جمل',
      notes: 'فلات وايت وكوكيز',
      createdAt: Date.now() - 3600000 * 8,
    },
  ];
}

export function getInitialBudgets(): Budget[] {
  return [
    { id: 'b-total', categoryId: 'all', amount: 8000, period: 'monthly' },
    { id: 'b-food', categoryId: 'food', amount: 1500, period: 'monthly' },
    { id: 'b-groceries', categoryId: 'groceries', amount: 1800, period: 'monthly' },
    { id: 'b-transport', categoryId: 'transport', amount: 600, period: 'monthly' },
    { id: 'b-cafe', categoryId: 'cafe', amount: 350, period: 'monthly' },
    { id: 'b-shopping', categoryId: 'shopping', amount: 1000, period: 'monthly' },
    { id: 'b-bills', categoryId: 'bills', amount: 800, period: 'monthly' },
  ];
}

export function getInitialGoals(): SavingGoal[] {
  return [
    {
      id: 'g-1',
      title: 'صندوق الطوارئ (3 أشهر)',
      targetAmount: 15000,
      currentAmount: 9500,
      deadline: '2026-12-31',
      categoryIcon: 'ShieldCheck',
      color: '#10b981',
    },
    {
      id: 'g-2',
      title: 'رحلة إجازة الصيف',
      targetAmount: 8000,
      currentAmount: 4800,
      deadline: '2026-07-15',
      categoryIcon: 'Plane',
      color: '#0284c7',
    },
    {
      id: 'g-3',
      title: 'شراء لابتوب برمجي جديد',
      targetAmount: 6500,
      currentAmount: 5200,
      deadline: '2026-09-30',
      categoryIcon: 'Laptop',
      color: '#8b5cf6',
    },
  ];
}

export function getInitialChat(): ChatMessage[] {
  return [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `أهلاً بك! 👋 أنا **مستشارك المالي الذكي** ومساعدك المحاسبي اليومي.
يمكنني مساعدتك في:
1. 📊 **تحليل مصاريفك اليومية والشهرية** واقتراح أماكن للتوفير.
2. 💡 **بناء خطة ميزانية ذكية** متوازنة (مثل قاعدة 50/30/20).
3. ⚡ **حساب مخصصك اليومي المسموح** لتتفادى تجاوز ميزانيتك.
4. 🧾 **توجيهك في التعامل مع الفواتير والمصاريف غير المتوقعة**.

كيف يمكنني مساعدتك مالياً اليوم؟`,
      timestamp: Date.now(),
      model: 'gemini-3.5-flash',
    },
  ];
}

// LocalStorage Helper API
export const Storage = {
  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const initial = getInitialTransactions();
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialTransactions();
    }
  },

  saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      const initial = getInitialBudgets();
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialBudgets();
    }
  },

  saveBudgets(budgets: Budget[]) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getGoals(): SavingGoal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      const initial = getInitialGoals();
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialGoals();
    }
  },

  saveGoals(goals: SavingGoal[]) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getChatMessages(): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (!raw) {
      const initial = getInitialChat();
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialChat();
    }
  },

  saveChatMessages(messages: ChatMessage[]) {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },

  getVisuals(): GeneratedVisual[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VISUALS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveVisuals(visuals: GeneratedVisual[]) {
    localStorage.setItem(STORAGE_KEYS.VISUALS, JSON.stringify(visuals));
  },

  getCurrency(): CurrencyCode {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode) || 'SAR';
  },

  saveCurrency(currency: CurrencyCode) {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  },

  exportAllDataJSON(): string {
    const data = {
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      currency: this.getCurrency(),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importAllDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (Array.isArray(data.budgets)) {
        this.saveBudgets(data.budgets);
      }
      if (Array.isArray(data.goals)) {
        this.saveGoals(data.goals);
      }
      if (data.currency) {
        this.saveCurrency(data.currency);
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.VISUALS);
  },
};
