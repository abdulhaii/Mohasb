import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Receipt,
  Store,
  Calendar,
  Tag
} from 'lucide-react';
import { Transaction, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/formatters';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedExpense: (tx: Partial<Transaction>) => void;
  currency: CurrencyCode;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedExpense,
  currency,
}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setParsedResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imageBase64 && !rawText.trim()) {
      setError('يرجى اختيار صورة فاتورة أو لصق نص الفاتورة أولاً.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setParsedResult(null);

    try {
      const response = await fetch('/api/gemini/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          rawText: rawText.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل في قراءة الفاتورة.');
      }

      setParsedResult(data.data);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'حدث خطأ أثناء فحص الفاتورة.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;

    // Match category
    let matchedCatId = 'food';
    const catName = parsedResult.category || '';
    if (catName.includes('سوبرماركت') || catName.includes('بقالة') || catName.includes('تموينات')) {
      matchedCatId = 'groceries';
    } else if (catName.includes('كافيه') || catName.includes('قهوة')) {
      matchedCatId = 'cafe';
    } else if (catName.includes('مواصلات') || catName.includes('بنزين') || catName.includes('وقود')) {
      matchedCatId = 'transport';
    } else if (catName.includes('سكن') || catName.includes('إيجار')) {
      matchedCatId = 'housing';
    } else if (catName.includes('فواتير') || catName.includes('خدمات')) {
      matchedCatId = 'bills';
    } else if (catName.includes('تسوق') || catName.includes('ملابس')) {
      matchedCatId = 'shopping';
    } else if (catName.includes('صحة') || catName.includes('علاج') || catName.includes('صيدلية')) {
      matchedCatId = 'health';
    } else if (catName.includes('ترفيه') || catName.includes('سينما')) {
      matchedCatId = 'entertainment';
    }

    onApplyParsedExpense({
      type: 'expense',
      amount: parseFloat(parsedResult.amount) || 0,
      merchant: parsedResult.merchant || '',
      date: parsedResult.date || new Date().toISOString().split('T')[0],
      time: parsedResult.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      categoryId: matchedCatId,
      notes: parsedResult.notes || (parsedResult.items ? `المشتريات: ${parsedResult.items.map((i: any) => i.name).join(', ')}` : ''),
      receiptImage: imageBase64 || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#121214] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800 flex flex-col text-zinc-100">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/50 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">قارئ الفواتير بالذكاء الاصطناعي</h2>
              <p className="text-xs text-zinc-400">استخراج المبلغ والتفاصيل تلقائياً من الإيصال</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-zinc-200">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              1. اختر صورة الفاتورة أو التقط صورة
            </label>

            {imageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black/60 p-2">
                <img
                  src={imageBase64}
                  alt="Receipt Preview"
                  className="w-full h-48 object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setImageBase64(null)}
                  className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-zinc-900/90 text-zinc-200 text-xs font-bold hover:bg-rose-600 hover:text-white transition-colors"
                >
                  تغيير الصورة
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-purple-800/60 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500 cursor-pointer transition-all text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 text-purple-400 border border-purple-800/50 flex items-center justify-center mb-2 shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-zinc-200">اضغط لرفع صورة الفاتورة</span>
                <span className="text-[11px] text-zinc-400 mt-1">يدعم JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              أو الصق نص رسالة الدفع البنكية / الفاتورة:
            </label>
            <textarea
              rows={2}
              placeholder="مثال: شراء عبر نقاط البيع بمبلغ 145.50 لدى سوبرماركت بنده..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Action: Scan with Gemini */}
          <button
            onClick={handleScan}
            disabled={isScanning || (!imageBase64 && !rawText.trim())}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>جاري قراءة واستخراج بيانات الفاتورة بـ Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تحليل الفاتورة بالذكاء الاصطناعي</span>
              </>
            )}
          </button>

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم استخراج البيانات بنجاح!</span>
                </span>
                <span className="text-base font-black text-emerald-400">
                  {formatCurrency(parsedResult.amount || 0, currency)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-300 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px]">المتجر / الجهة:</span>
                  <span className="font-bold text-zinc-100">{parsedResult.merchant || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">التاريخ:</span>
                  <span>{parsedResult.date || 'اليوم'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">التصنيف المقترح:</span>
                  <span className="text-purple-300 font-bold">{parsedResult.category || 'طعام ومشتريات'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">طريقة الدفع:</span>
                  <span>{parsedResult.paymentMethod || 'بطاقة بنكية'}</span>
                </div>
              </div>

              {parsedResult.items && parsedResult.items.length > 0 && (
                <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 block mb-1">قائمة الأصناف:</span>
                  <ul className="text-[11px] text-zinc-300 space-y-0.5 max-h-24 overflow-y-auto">
                    {parsedResult.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span>• {item.name}</span>
                        <span className="font-bold">{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إدراج في سجل المصاريف فوراً</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
