import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { DayCalculation, ExpenseItem } from '../types';
import { formatPeso } from '../utils/currency';

interface DayDetailModalProps {
  day: DayCalculation | null;
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (date: string, description: string, amount: number, category: ExpenseItem['category']) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  isOpen,
  onClose,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('food');

  if (!isOpen || !day) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!desc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense(day.date, desc.trim(), parsedAmount, category);
    setDesc('');
    setAmount('');
  };

  const isSurplus = day.carriedRollover >= 0;
  const isEndSurplus = day.rolloverToNextDay >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                Day {day.dayIndex}
              </span>
              <h2 className="text-base font-bold text-white">
                {day.dayOfWeek}, {day.formattedDate}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">Daily limit calculation & rollover mechanics</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Rollover Breakdown Card */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Limit Breakdown
            </div>

            <div className="space-y-2 text-xs">
              {/* Base allowance */}
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Daily Allowance</span>
                <span className="font-semibold text-white tabular-nums">
                  {formatPeso(day.baseLimit)}
                </span>
              </div>

              {/* Carried Rollover */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  {isSurplus ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Carried from Day {day.dayIndex - 1}</span>
                </span>
                <span
                  className={`font-semibold tabular-nums ${
                    isSurplus ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPeso(day.carriedRollover, { showSign: true })}
                </span>
              </div>

              {/* Hairline Divider */}
              <div className="border-t border-slate-700 my-1.5" />

              {/* Adjusted Target Limit */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-200">Adjusted Daily Limit</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatPeso(day.calculatedLimit)}
                </span>
              </div>

              {/* Total Spent */}
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Spent Today</span>
                <span className="font-semibold text-rose-400 tabular-nums">
                  -{formatPeso(day.totalSpent)}
                </span>
              </div>

              {/* Resulting Rollover to Next Day */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Rollover into Day {day.dayIndex + 1}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isEndSurplus ? 'Surplus will boost tomorrow' : 'Deficit will deduct tomorrow'}
                  </div>
                </div>
                <div
                  className={`text-sm font-mono font-bold tabular-nums ${
                    isEndSurplus ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPeso(day.rolloverToNextDay, { showSign: true })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-add Transaction Form */}
          <form onSubmit={handleCreate} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Log Expense for this Day</div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Lunch, Jeepney Fare"
                className="col-span-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 select-none">
                  ₱
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                  required
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                className="px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="food">🍱 Food / Meals</option>
                <option value="fare">🚌 Fare / Commute</option>
                <option value="groceries">🛒 Groceries</option>
                <option value="coffee">☕ Coffee</option>
                <option value="medical">💊 Medical / Pharmacy</option>
                <option value="misc">📦 Misc / Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </form>

          {/* Transactions List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>Expenses ({day.transactions.length})</span>
              <span>Total: {formatPeso(day.totalSpent)}</span>
            </div>

            {day.transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                No expenses logged for this day. Entire limit rolls forward!
              </div>
            ) : (
              <div className="space-y-1.5">
                {day.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center text-xs text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{tx.description}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{tx.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        {formatPeso(tx.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(tx.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
