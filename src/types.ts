export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'card' | 'apple_pay' | 'transfer' | 'other';

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  bgLight: string;
  type: TransactionType;
}

export interface TransactionItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod: PaymentMethod;
  merchant?: string;
  notes?: string;
  receiptImage?: string;
  items?: TransactionItem[];
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string; // categoryId or 'all' for total monthly budget
  amount: number;
  period: 'monthly' | 'weekly';
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryIcon?: string;
  color?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
}

export interface GeneratedVisual {
  id: string;
  prompt: string;
  imageUrl: string;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: string;
  createdAt: number;
  title?: string;
}

export type CurrencyCode = 'SAR' | 'AED' | 'EGP' | 'KWD' | 'QAR' | 'USD' | 'EUR' | 'BHD' | 'OMR' | 'JOD';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateToSAR: number;
}

export type ActiveTab = 'daily' | 'budgets' | 'analytics' | 'advisor' | 'goals' | 'studio';
