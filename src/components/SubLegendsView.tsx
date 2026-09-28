import React, { useState } from 'react';
import { BillItem, SavingsItem, LeisureItem, Allocations } from '../types';
import { formatPeso } from '../utils/currency';
import {
  CreditCard,
  PiggyBank,
  PartyPopper,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubLegendsViewProps {
  initialSubTab?: 'debtBills' | 'savings' | 'leisure';
  bills: BillItem[];
  savings: SavingsItem[];
  leisure: LeisureItem[];
  allocations: Allocations;
  inflow: number;
  onUpdateBills: (bills: BillItem[]) => void;
  onUpdateSavings: (savings: SavingsItem[]) => void;
  onUpdateLeisure: (leisure: LeisureItem[]) => void;
}

export const SubLegendsView: React.FC<SubLegendsViewProps> = ({
  initialSubTab = 'debtBills',
  bills,
  savings,
  leisure,
  allocations,
  inflow,
  onUpdateBills,
  onUpdateSavings,
  onUpdateLeisure,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'debtBills' | 'savings' | 'leisure'>(initialSubTab);

  // Bill creation form
  const [newBillName, setNewBillName] = useState('');
  const [newBillTarget, setNewBillTarget] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState('');

  // Savings creation form
  const [newSavingsName, setNewSavingsName] = useState('');
  const [newSavingsTarget, setNewSavingsTarget] = useState('');
  const [newSavingsDeposit, setNewSavingsDeposit] = useState('');

  // Leisure creation form
  const [newLeisureActivity, setNewLeisureActivity] = useState('');
  const [newLeisureCost, setNewLeisureCost] = useState('');
  const [newLeisureStatus, setNewLeisureStatus] = useState<'spent' | 'reserved'>('reserved');

  // Calculations
  const billsAllocated = (inflow * allocations.debtBills) / 100;
  const billsTargetSum = bills.reduce((acc, b) => acc + b.target, 0);
  const billsPaidSum = bills.filter((b) => b.isPaid).reduce((acc, b) => acc + b.target, 0);
  const unpaidCount = bills.filter((b) => !b.isPaid).length;

  const savingsAllocated = (inflow * allocations.savings) / 100;
  const savingsDepositedSum = savings.reduce((acc, s) => acc + s.depositAmount, 0);
  const savingsTargetSum = savings.reduce((acc, s) => acc + s.target, 0);

  const leisureAllocated = (inflow * allocations.leisure) / 100;
  const leisureSpentSum = leisure.filter((l) => l.status === 'spent').reduce((acc, l) => acc + l.estimatedCost, 0);
  const leisureReservedSum = leisure.filter((l) => l.status === 'reserved').reduce((acc, l) => acc + l.estimatedCost, 0);
  const leisureTotalPlanned = leisureSpentSum + leisureReservedSum;

  // Handlers for Bills
  const toggleBillPaid = (id: string) => {
    const updated = bills.map((b) => {
      if (b.id === id) {
        const nextPaid = !b.isPaid;
        if (nextPaid) {
          try {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
          } catch {
            // ignore
          }
        }
        return { ...b, isPaid: nextPaid };
      }
      return b;
    });
    onUpdateBills(updated);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newBillTarget);
    if (!newBillName.trim() || isNaN(targetVal) || targetVal <= 0) return;

    const newBill: BillItem = {
      id: `bill-${Date.now()}`,
      name: newBillName.trim(),
      dueDate: newBillDueDate || 'Monthly',
      target: targetVal,
      isPaid: false,
      category: 'utility',
    };
    onUpdateBills([...bills, newBill]);
    setNewBillName('');
    setNewBillTarget('');
    setNewBillDueDate('');
  };

  const handleDeleteBill = (id: string) => {
    onUpdateBills(bills.filter((b) => b.id !== id));
  };

  // Handlers for Savings
  const handleAddSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newSavingsTarget);
    const depositVal = parseFloat(newSavingsDeposit) || 0;
    if (!newSavingsName.trim() || isNaN(targetVal) || targetVal <= 0) return;

    const newFund: SavingsItem = {
      id: `sav-${Date.now()}`,
      name: newSavingsName.trim(),
      target: targetVal,
      depositAmount: depositVal,
    };
    onUpdateSavings([...savings, newFund]);
    setNewSavingsName('');
    setNewSavingsTarget('');
    setNewSavingsDeposit('');
  };

  const handleUpdateSavingsDeposit = (id: string, newDeposit: number) => {
    onUpdateSavings(
      savings.map((s) => (s.id === id ? { ...s, depositAmount: Math.max(0, newDeposit) } : s))
    );
  };

  const handleDeleteSavings = (id: string) => {
    onUpdateSavings(savings.filter((s) => s.id !== id));
  };

  // Handlers for Leisure
  const handleAddLeisure = (e: React.FormEvent) => {
    e.preventDefault();
    const costVal = parseFloat(newLeisureCost);
    if (!newLeisureActivity.trim() || isNaN(costVal) || costVal <= 0) return;

    const newL: LeisureItem = {
      id: `lei-${Date.now()}`,
      activity: newLeisureActivity.trim(),
      estimatedCost: costVal,
      status: newLeisureStatus,
    };
    onUpdateLeisure([...leisure, newL]);
    setNewLeisureActivity('');
    setNewLeisureCost('');
  };

  const toggleLeisureStatus = (id: string) => {
    onUpdateLeisure(
      leisure.map((l) => (l.id === id ? { ...l, status: l.status === 'spent' ? 'reserved' : 'spent' } : l))
    );
  };

  const handleDeleteLeisure = (id: string) => {
    onUpdateLeisure(leisure.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Segmented Sub-Legends Tab Switcher */}
      <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('debtBills')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'debtBills'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="truncate">Bills ({bills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('savings')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'savings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span className="truncate">Savings ({savings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('leisure')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'leisure'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PartyPopper className="w-3.5 h-3.5" />
          <span className="truncate">Leisure ({leisure.length})</span>
        </button>
      </div>

      {/* 1. DEBT / FIXED BILLS SUB-LEGEND */}
      {activeSubTab === 'debtBills' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs text-violet-300">
              <span className="font-semibold">Inflow Allocated ({allocations.debtBills}%):</span>
              <span className="font-mono font-bold text-sm text-white">
                {formatPeso(billsAllocated)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Total Target of Bills:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatPeso(billsTargetSum)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400">
              <span>Paid So Far:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatPeso(billsPaidSum)}
              </span>
            </div>

            {billsTargetSum > billsAllocated && (
              <div className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 pt-1 border-t border-violet-900/60">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Total bills exceed this cycle&apos;s allocated budget by {formatPeso(billsTargetSum - billsAllocated)}</span>
              </div>
            )}
          </div>

          {/* Add Bill Form */}
          <form onSubmit={handleAddBill} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">Add New Fixed Bill</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Bill Name (e.g. Meralco)"
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              />
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-violet-400 font-bold">₱</span>
                <input
                  type="number"
                  placeholder="Target (₱)"
                  value={newBillTarget}
                  onChange={(e) => setNewBillTarget(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 tabular-nums"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Due Date (e.g. Oct 2)"
                value={newBillDueDate}
                onChange={(e) => setNewBillDueDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bill</span>
            </button>
          </form>

          {/* Bills List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Itemized Bills</span>
              <span>{unpaidCount} Pending</span>
            </div>

            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  bill.isPaid
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : 'bg-slate-900 border-slate-800 hover:border-violet-500/50'
                }`}
              >
                {/* Checkbox toggle */}
                <button
                  type="button"
                  onClick={() => toggleBillPaid(bill.id)}
                  className="flex items-center gap-2.5 text-left flex-1 cursor-pointer group"
                >
                  {bill.isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 group-hover:text-violet-400 shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        bill.isPaid ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {bill.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {bill.dueDate}</span>
                    </div>
                  </div>
                </button>

                {/* Amount and delete */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white tabular-nums">
                      {formatPeso(bill.target)}
                    </div>
                    <div
                      className={`text-[10px] font-semibold uppercase ${
                        bill.isPaid ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {bill.isPaid ? 'Paid' : 'Unpaid'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBill(bill.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SAVINGS SUB-LEGEND */}
      {activeSubTab === 'savings' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-semibold">Inflow Allocated ({allocations.savings}%):</span>
              <span className="font-mono font-bold text-sm text-white">
                {formatPeso(savingsAllocated)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Cycle Deposits:</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {formatPeso(savingsDepositedSum)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Long-Term Target Sum:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatPeso(savingsTargetSum)}
              </span>
            </div>
          </div>

          {/* Add Savings Form */}
          <form onSubmit={handleAddSavings} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">Add New Savings Fund</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Fund Name (e.g. Emergency)"
                value={newSavingsName}
                onChange={(e) => setNewSavingsName(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold">₱</span>
                <input
                  type="number"
                  placeholder="Total Target Goal"
                  value={newSavingsTarget}
                  onChange={(e) => setNewSavingsTarget(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                  required
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold">₱</span>
                <input
                  type="number"
                  placeholder="Deposit Amount This Cycle"
                  value={newSavingsDeposit}
                  onChange={(e) => setNewSavingsDeposit(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Savings Fund</span>
            </button>
          </form>

          {/* Savings Funds List */}
          <div className="space-y-2.5">
            {savings.map((s) => {
              const progress = s.target > 0 ? Math.min(100, (s.depositAmount / s.target) * 100) : 0;

              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Target Goal: {formatPeso(s.target)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                          {formatPeso(s.depositAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400">{progress.toFixed(1)}% funded</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSavings(s.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300"
                    />
                  </div>

                  {/* Quick deposit editor */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Deposit this cycle:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateSavingsDeposit(s.id, s.depositAmount + 250)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium"
                      >
                        +₱250
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSavingsDeposit(s.id, s.depositAmount + 500)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium"
                      >
                        +₱500
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LEISURE / WANTS SUB-LEGEND */}
      {activeSubTab === 'leisure' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span className="font-semibold">Inflow Allocated ({allocations.leisure}%):</span>
              <span className="font-mono font-bold text-sm text-white">
                {formatPeso(leisureAllocated)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Already Spent:</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">
                {formatPeso(leisureSpentSum)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Reserved for upcoming:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatPeso(leisureReservedSum)}
              </span>
            </div>

            <div className="border-t border-amber-900/60 pt-1 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Remaining Leisure Budget:</span>
              <span
                className={`font-mono tabular-nums ${
                  leisureAllocated - leisureTotalPlanned >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPeso(leisureAllocated - leisureTotalPlanned)}
              </span>
            </div>
          </div>

          {/* Add Leisure Form */}
          <form onSubmit={handleAddLeisure} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">Add Leisure Activity</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Activity (e.g. Samgyup)"
                value={newLeisureActivity}
                onChange={(e) => setNewLeisureActivity(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold">₱</span>
                <input
                  type="number"
                  placeholder="Cost (₱)"
                  value={newLeisureCost}
                  onChange={(e) => setNewLeisureCost(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 tabular-nums"
                  required
                />
              </div>
              <select
                value={newLeisureStatus}
                onChange={(e) => setNewLeisureStatus(e.target.value as 'spent' | 'reserved')}
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="reserved">Reserved (Planning)</option>
                <option value="spent">Spent (Already paid)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </form>

          {/* Leisure List */}
          <div className="space-y-2">
            {leisure.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{item.activity}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleLeisureStatus(item.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                        item.status === 'spent'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status} (tap to toggle)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-xs font-mono font-bold text-white tabular-nums">
                    {formatPeso(item.estimatedCost)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLeisure(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
