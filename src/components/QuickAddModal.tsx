import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  Calendar,
  Clock,
  Store,
  FileText,
  CreditCard,
  Image as ImageIcon,
  Sparkles,
  Layers
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currency: CurrencyCode;
  initialData?: Partial<Transaction> | null;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [merchant, setMerchant] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      if (initialData.type) setType(initialData.type);
      if (initialData.amount) setAmount(String(initialData.amount));
      if (initialData.categoryId) setCategoryId(initialData.categoryId);
      if (initialData.date) setDate(initialData.date);
      if (initialData.time) setTime(initialData.time);
      if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
      if (initialData.merchant) setMerchant(initialData.merchant);
      if (initialData.notes) setNotes(initialData.notes);
      if (initialData.receiptImage) setReceiptImage(initialData.receiptImage);
    } else {
      // Reset defaults
      setType('expense');
      setAmount('');
      setCategoryId('food');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      );
      setPaymentMethod('card');
      setMerchant('');
      setNotes('');
      setReceiptImage(undefined);
    }
    setError('');
  }, [initialData, isOpen]);

  // Adjust default category when type flips
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense' && (categoryId === 'salary' || categoryId === 'freelance')) {
      setCategoryId('food');
    } else if (newType === 'income') {
      setCategoryId('salary');
    }
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر.');
      return;
    }

    if (!categoryId) {
      setError('يرجى اختيار تصنيف للمعاملة.');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      categoryId,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      paymentMethod,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptImage,
    });

    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#121214] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800 flex flex-col text-zinc-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#121214]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                type === 'expense' ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50' : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
              }`}
            >
              {type === 'expense' ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {initialData ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
              </h2>
              <p className="text-xs text-zinc-400">تسجيل وتوثيق المصاريف والدخل بسهولة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-zinc-200">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Segment: Expense / Income */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-2xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>مصروف يومي</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>دخل أو إيداع</span>
            </button>
          </div>

          {/* Large Amount Input */}
          <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 text-center">
            <label className="text-xs font-semibold text-zinc-400 block mb-1">المبلغ المطلوب</label>
            <div className="flex items-center justify-center">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-48 text-center text-3xl font-black text-zinc-100 bg-transparent border-b-2 border-emerald-500 focus:outline-hidden py-1 tracking-tight"
              />
            </div>

            {/* Quick + Buttons */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {[10, 20, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:border-emerald-500 text-xs font-bold transition-all cursor-pointer"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 border border-zinc-700/60 text-xs font-bold transition-all cursor-pointer"
              >
                مسح
              </button>
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">اختر الفئة</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 ring-2 ring-emerald-500/20 font-bold shadow-xs'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] leading-tight line-clamp-1">{cat.nameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>التاريخ</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>الوقت</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">طريقة الدفع</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {pm.nameAr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Store / Merchant & Notes */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1">
                <Store className="w-3.5 h-3.5 text-zinc-500" />
                <span>المتجر أو الجهة (اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: سوبرماركت بنده، مطعم البيك، كافيه..."
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>ملاحظات إضافية (اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: غداء مع الأصدقاء، شراء مستلزمات مكتبية..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Receipt Attachment */}
          <div className="pt-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>إرفاق صورة الفاتورة (اختياري)</span>
              </span>
              {receiptImage && (
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  إزالة الصورة
                </button>
              )}
            </label>
            {receiptImage ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 max-h-32 bg-black/50 flex items-center justify-center">
                <img
                  src={receiptImage}
                  alt="Receipt attachment"
                  className="w-full h-32 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 hover:bg-zinc-800 cursor-pointer transition-colors text-xs text-zinc-400 font-medium">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                <span>اضغط لرفع صورة إيصال أو فاتورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات' : 'تسجيل المعاملة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
