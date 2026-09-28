import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { ExpenseItem, PayPeriod } from '../types';
import { formatShortMonthDay, generateDateSequence, toIsoDate } from '../utils/dateCalculations';
import { formatPeso } from '../utils/currency';

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  payPeriod: PayPeriod;
  currentDayLimit?: number;
  onAddExpense: (date: string, description: string, amount: number, category: ExpenseItem['category']) => void;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  payPeriod,
  currentDayLimit = 0,
  onAddExpense,
}) => {
  const dates = generateDateSequence(payPeriod.startDate, payPeriod.endDate);
  const todayStr = toIsoDate(new Date());
  // Default to today if within period, else startDate
  const defaultSelectedDate = dates.includes(todayStr) ? todayStr : payPeriod.startDate;

  const [date, setDate] = useState(defaultSelectedDate);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('food');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!desc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense(date, desc.trim(), parsedAmount, category);
    setDesc('');
    setAmount('');
    onClose();
  };

  const quickPresets = [
    { label: 'MRT / Jeep Fare (₱50)', desc: 'MRT / Jeep Fare', amt: '50', cat: 'fare' as const },
    { label: 'Jollibee Lunch (₱120)', desc: 'Jollibee Lunch', amt: '120', cat: 'food' as const },
    { label: '7-Eleven Coffee (₱60)', desc: '7-Eleven Coffee', amt: '60', cat: 'coffee' as const },
    { label: 'Mini Mart Run (₱250)', desc: 'Mini Mart Groceries', amt: '250', cat: 'groceries' as const },
  ];

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setDesc(preset.desc);
    setAmount(preset.amt);
    setCategory(preset.cat);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quick Log Daily Expense</h2>
              <p className="text-[11px] text-slate-400">Updates next-day rollover automatically</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <div className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Common Philippine Expenses:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Expense Date
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {dates.map((d, index) => (
                <option key={d} value={d}>
                  Day {index + 1}: {formatShortMonthDay(d)} {d === todayStr ? '(Today)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description / Store
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Lunch with coworkers, Bus ride"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Amount (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400 select-none">
                  ₱
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="food">🍱 Food / Meals</option>
                <option value="fare">🚌 Fare / Commute</option>
                <option value="groceries">🛒 Groceries</option>
                <option value="coffee">☕ Coffee</option>
                <option value="medical">💊 Medical</option>
                <option value="misc">📦 Misc</option>
              </select>
            </div>
          </div>

          {/* Limit preview helper */}
          {currentDayLimit > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between text-slate-400">
              <span>Today&apos;s active limit:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatPeso(currentDayLimit)}
              </span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
