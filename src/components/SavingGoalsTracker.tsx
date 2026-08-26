import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plane,
  Laptop,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingGoal, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SavingGoalsTrackerProps {
  goals: SavingGoal[];
  currency: CurrencyCode;
  onSaveGoal: (goal: SavingGoal) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
}

const GOAL_ICONS: Record<string, any> = {
  ShieldCheck,
  Plane,
  Laptop,
  Car,
  Coins,
  Target,
};

export const SavingGoalsTracker: React.FC<SavingGoalsTrackerProps> = ({
  goals,
  currency,
  onSaveGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('Coins');
  const [color, setColor] = useState('#10b981');

  const handleOpenAddEdit = (goal?: SavingGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setTitle(goal.title);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setDeadline(goal.deadline || '');
      setIcon(goal.categoryIcon || 'Coins');
      setColor(goal.color || '#10b981');
    } else {
      setEditingGoal(null);
      setTitle('');
      setTargetAmount('5000');
      setCurrentAmount('0');
      setDeadline('');
      setIcon('Coins');
      setColor('#10b981');
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;
    if (!title.trim() || !target || target <= 0) return;

    onSaveGoal({
      id: editingGoal ? editingGoal.id : `g-${Date.now()}`,
      title: title.trim(),
      targetAmount: target,
      currentAmount: curr,
      deadline: deadline || undefined,
      categoryIcon: icon,
      color,
    });

    setModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const addAmt = parseFloat(depositAmount);
    if (!addAmt || addAmt <= 0) return;

    const newTotal = depositModalGoal.currentAmount + addAmt;
    onDepositToGoal(depositModalGoal.id, addAmt);

    // If goal reached, fire confetti!
    if (newTotal >= depositModalGoal.targetAmount) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log(err);
      }
    }

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-zinc-900 border border-emerald-800/40 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-black">
              أهداف الادخار وصناديق الطوارئ
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-100">
            {formatCurrency(totalSaved, currency)}
            <span className="text-sm text-emerald-300 font-medium block sm:inline mr-2">
              مدخراتك المحققة من أصل {formatCurrency(totalTarget, currency)} ({overallPercent}%)
            </span>
          </h2>
          <p className="text-xs text-zinc-300 max-w-lg">
            خطط لأهدافك المستقبلية وأمانك المالي خطوة بخطوة مع حسابات دقيقة لنسب الإنجاز.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddEdit()}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء هدف ادخار جديد</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const IconComp = GOAL_ICONS[goal.categoryIcon || 'Coins'] || Coins;

          return (
            <div
              key={goal.id}
              className="bg-[#121214] rounded-3xl p-5 border border-zinc-800/80 shadow-lg shadow-black/20 hover:border-zinc-700 transition-all flex flex-col justify-between text-zinc-100"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: goal.color || '#10b981' }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{goal.title}</h3>
                      {goal.deadline && (
                        <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>الموعد: {goal.deadline}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddEdit(goal)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Progress */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">المبلغ المجموع</span>
                    <span className="text-lg font-black text-zinc-100">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-zinc-400 font-semibold block">الهدف المطلوب</span>
                    <span className="text-xs font-bold text-zinc-300">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-3 border border-zinc-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#10b981',
                    }}
                  />
                </div>
              </div>

              {/* Footer status & deposit action */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  {isCompleted ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>اكتمل الهدف بنجاح! 100%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400 font-semibold">
                      متبقي: {formatCurrency(remaining, currency)} ({percent}%)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositAmount('100');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold border border-emerald-800/60 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إيداع مبلغ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-1">
              إيداع في {depositModalGoal.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              المبلغ الحالي: {formatCurrency(depositModalGoal.currentAmount, currency)}
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  المبلغ المضاف
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="مثال: 500"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-base font-black text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Quick + Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50, 100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(String(val))}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-zinc-700/50"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  تأكيد الإيداع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-1">
              {editingGoal ? 'تعديل هدف الادخار' : 'إنشاء هدف ادخار جديد'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">حدد اسم الهدف والمبلغ المستهدف</p>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">اسم الهدف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شراء سيارة، رحلة سياحية، صندوق طوارئ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    المبلغ المستهدف
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    المبلغ الحالي
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  تاريخ الإنجاز المستهدف (اختياري)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-100 focus:outline-hidden focus:border-emerald-500"
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
                  حفظ الهدف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
