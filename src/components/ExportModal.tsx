import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  CheckCircle2,
  FileJson,
  AlertTriangle
} from 'lucide-react';
import { Transaction, CurrencyCode } from '../types';
import { CURRENCIES, DEFAULT_CATEGORIES } from '../data/categories';
import { formatCurrency, formatArabicDate, exportTransactionsToCSV } from '../utils/formatters';
import { Storage } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: CurrencyCode;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  onDataReload: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currency,
  totalIncome,
  totalExpenses,
  netBalance,
  onDataReload,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvData = exportTransactionsToCSV(transactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonStr = Storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-accountant-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = Storage.importAllDataJSON(content);
        if (success) {
          setImportStatus('تم استيراد البيانات بنجاح!');
          onDataReload();
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('خطأ: الملف غير صالح.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من إعادة ضبط البيانات للوضع الافتراضي؟')) {
      Storage.resetToDefault();
      onDataReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#121214] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800 flex flex-col text-zinc-100">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#121214] z-10 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">تصدير وطباعة التقارير المحاسبية</h2>
              <p className="text-xs text-zinc-400">حفظ نسخة احتياطية أو تصدير بصيغة Excel و PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Strip */}
        <div className="p-5 space-y-4 text-zinc-200">
          
          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
            <button
              onClick={handlePrint}
              className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب (PDF)</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير إلى ملف Excel (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print pt-2 border-t border-zinc-800">
            <button
              onClick={handleDownloadJSON}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-zinc-500" />
              <span>تنزيل نسخة احتياطية (JSON)</span>
            </button>

            <label className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span>استعادة نسخة احتياطية</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          {/* Printable Report Preview */}
          <div className="mt-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-100">كشف حساب المصاريف اليومية</h3>
                <span className="text-[11px] text-zinc-500">
                  تاريخ التقرير: {new Date().toLocaleDateString('ar-SA-u-nu-latn')}
                </span>
              </div>
              <div className="text-left text-xs font-bold text-zinc-400">
                <span>تقرير المعاملات المالية</span>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-2 bg-[#121214] p-3 rounded-xl border border-zinc-800 text-xs font-bold text-center">
              <div>
                <span className="text-zinc-500 block text-[10px]">إجمالي الدخل</span>
                <span className="text-emerald-400">{formatCurrency(totalIncome, currency)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">إجمالي المصاريف</span>
                <span className="text-rose-400">{formatCurrency(totalExpenses, currency)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">الرصيد الصافي</span>
                <span className={netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(netBalance, currency)}
                </span>
              </div>
            </div>

            {/* List preview */}
            <div className="max-h-56 overflow-y-auto space-y-1 text-xs">
              {transactions.slice(0, 15).map((tx) => {
                const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#121214] border border-zinc-800/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-[10px]">{formatArabicDate(tx.date)}</span>
                      <span className="font-bold text-zinc-200">{tx.merchant || cat?.nameAr}</span>
                      <span className="text-[10px] text-zinc-500">({cat?.nameAr})</span>
                    </div>
                    <span
                      className={`font-black ${
                        tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'} {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>

            {transactions.length > 15 && (
              <p className="text-[10px] text-zinc-500 text-center">
                + {transactions.length - 15} معاملات أخرى مسجلة...
              </p>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 flex justify-between items-center text-xs text-zinc-500 no-print">
            <button
              onClick={handleResetData}
              className="text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط البيانات التجريبية</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
