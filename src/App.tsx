/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PayPeriod,
  Allocations,
  BillItem,
  SavingsItem,
  LeisureItem,
  ExpenseItem,
} from './types';
import {
  DEFAULT_PAY_PERIOD,
  DEFAULT_ALLOCATIONS,
  DEFAULT_BILLS,
  DEFAULT_SAVINGS,
  DEFAULT_LEISURE,
  DEFAULT_EXPENSES,
} from './data/defaultData';
import { computeDailyRollover } from './utils/rolloverEngine';
import { formatPeso } from './utils/currency';
import { formatShortMonthDay, toIsoDate } from './utils/dateCalculations';
import { AndroidFrame } from './components/AndroidFrame';
import { M3NavigationBar, TabId } from './components/M3NavigationBar';
import { MovableFab } from './components/MovableFab';
import { PayPeriodSetupModal } from './components/PayPeriodSetupModal';
import { AllocationSettings } from './components/AllocationSettings';
import { DailyRolloverView } from './components/DailyRolloverView';
import { SubLegendsView } from './components/SubLegendsView';
import { QuickAddTransactionModal } from './components/QuickAddTransactionModal';
import { KotlinSourceModal } from './components/KotlinSourceModal';
import {
  Calendar,
  Wallet,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Receipt,
  PiggyBank,
  PartyPopper,
  Edit3,
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [payPeriod, setPayPeriod] = useState<PayPeriod>(() => {
    const saved = localStorage.getItem('sweldo_pay_period');
    return saved ? JSON.parse(saved) : DEFAULT_PAY_PERIOD;
  });

  const [allocations, setAllocations] = useState<Allocations>(() => {
    const saved = localStorage.getItem('sweldo_allocations');
    return saved ? JSON.parse(saved) : DEFAULT_ALLOCATIONS;
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    const saved = localStorage.getItem('sweldo_bills');
    return saved ? JSON.parse(saved) : DEFAULT_BILLS;
  });

  const [savings, setSavings] = useState<SavingsItem[]>(() => {
    const saved = localStorage.getItem('sweldo_savings');
    return saved ? JSON.parse(saved) : DEFAULT_SAVINGS;
  });

  const [leisure, setLeisure] = useState<LeisureItem[]>(() => {
    const saved = localStorage.getItem('sweldo_leisure');
    return saved ? JSON.parse(saved) : DEFAULT_LEISURE;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('sweldo_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [subLegendInitialTab, setSubLegendInitialTab] = useState<'debtBills' | 'savings' | 'leisure'>('debtBills');
  const [isDeviceMode, setIsDeviceMode] = useState<boolean>(true);
  const [isPayPeriodModalOpen, setIsPayPeriodModalOpen] = useState<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sweldo_pay_period', JSON.stringify(payPeriod));
  }, [payPeriod]);

  useEffect(() => {
    localStorage.setItem('sweldo_allocations', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('sweldo_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('sweldo_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('sweldo_leisure', JSON.stringify(leisure));
  }, [leisure]);

  useEffect(() => {
    localStorage.setItem('sweldo_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Compute daily rollover engine
  const rolloverSummary = useMemo(() => {
    return computeDailyRollover(payPeriod, allocations, expenses);
  }, [payPeriod, allocations, expenses]);

  // Find today's calculation or current active day
  const todayStr = toIsoDate(new Date());
  const todayCalculation = useMemo(() => {
    const found = rolloverSummary.days.find((d) => d.date === todayStr);
    return found || rolloverSummary.days[0];
  }, [rolloverSummary, todayStr]);

  // Unpaid bills count for navigation badge
  const unpaidBillsCount = useMemo(() => {
    return bills.filter((b) => !b.isPaid).length;
  }, [bills]);

  // Expense handlers
  const handleAddExpense = (
    date: string,
    description: string,
    amount: number,
    category: ExpenseItem['category']
  ) => {
    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date,
      description,
      amount,
      category,
      timestamp: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // Navigate to Sub-Legend
  const handleOpenSubLegend = (category: 'debtBills' | 'savings' | 'leisure') => {
    setSubLegendInitialTab(category);
    setActiveTab('sublegends');
  };

  return (
    <AndroidFrame
      isDeviceMode={isDeviceMode}
      onToggleDeviceMode={() => setIsDeviceMode(!isDeviceMode)}
    >
      {/* Viewport container with innerPadding and absolute positioning for Movable FAB */}
      <div
        ref={containerRef}
        className="w-full h-full relative flex flex-col bg-slate-950 text-slate-100 overflow-hidden"
      >
        {/* Top App Bar (Material 3 TopAppBar) */}
        <header className="h-14 px-4 sm:px-6 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SweldoSplitter</h1>
              <p className="text-[10px] text-slate-400">Income Allocation & Rollover Budget</p>
            </div>
          </div>

          {/* Quick Payday Period Pill Trigger */}
          <button
            type="button"
            onClick={() => setIsPayPeriodModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {formatShortMonthDay(payPeriod.startDate)} - {formatShortMonthDay(payPeriod.endDate)}
            </span>
            <span className="sm:hidden">{rolloverSummary.totalDays}d</span>
            <Edit3 className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </header>

        {/* Scrollable Root Container (with contentPadding = innerPadding so bottom items never overlap taskbar) */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-24 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* TAB 1: BUDGET DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Primary Payday & Salary Summary Card */}
              <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Active Pay Period
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPayPeriodModalOpen(true)}
                    className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Change Setup</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                      {formatPeso(payPeriod.inflow)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>{formatShortMonthDay(payPeriod.startDate)}</span>
                      <span>→</span>
                      <span>{formatShortMonthDay(payPeriod.endDate)}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">
                        {rolloverSummary.totalDays} Days Cycle
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Daily Allowance</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                      {formatPeso(rolloverSummary.baseDailyAllowance)}/day
                    </span>
                  </div>
                </div>

                {/* 4 Category Quick Glance Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenSubLegend('savings')}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-left hover:border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <PiggyBank className="w-3 h-3" />
                      <span>Savings ({allocations.savings}%)</span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5 tabular-nums">
                      {formatPeso((payPeriod.inflow * allocations.savings) / 100)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenSubLegend('debtBills')}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-left hover:border-violet-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-violet-400">
                      <Receipt className="w-3 h-3" />
                      <span>Bills ({allocations.debtBills}%)</span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5 tabular-nums">
                      {formatPeso((payPeriod.inflow * allocations.debtBills) / 100)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('daily')}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-left hover:border-sky-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Daily ({allocations.dailyExpenses}%)</span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5 tabular-nums">
                      {formatPeso((payPeriod.inflow * allocations.dailyExpenses) / 100)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenSubLegend('leisure')}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-left hover:border-amber-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                      <PartyPopper className="w-3 h-3" />
                      <span>Leisure ({allocations.leisure}%)</span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5 tabular-nums">
                      {formatPeso((payPeriod.inflow * allocations.leisure) / 100)}
                    </div>
                  </button>
                </div>
              </section>

              {/* Today's Rollover Spotlight */}
              {todayCalculation && (
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Today&apos;s Active Limit · Day {todayCalculation.dayIndex} ({todayCalculation.dayOfWeek},{' '}
                        {todayCalculation.formattedDate})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('daily')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      View All Days →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 block">Today&apos;s Limit</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">
                        {formatPeso(todayCalculation.calculatedLimit)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 block">Spent Today</span>
                      <span className="text-sm sm:text-base font-bold text-rose-400 font-mono tabular-nums">
                        {formatPeso(todayCalculation.totalSpent)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 block">Tomorrow Rollover</span>
                      <span
                        className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                          todayCalculation.rolloverToNextDay >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPeso(todayCalculation.rolloverToNextDay, { showSign: true })}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* Percentage Allocations Adjuster */}
              <AllocationSettings
                allocations={allocations}
                inflow={payPeriod.inflow}
                onChangeAllocations={setAllocations}
                onOpenSubLegend={handleOpenSubLegend}
              />

              {/* Recent Daily Expenses Quick Feed */}
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Expenses ({expenses.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    + Log Expense
                  </button>
                </div>

                {expenses.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No transactions recorded yet. Tap the movable + button to log expenses.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {expenses.slice(0, 5).map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{exp.description}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span>{formatShortMonthDay(exp.date)}</span>
                            <span>·</span>
                            <span className="capitalize">{exp.category}</span>
                          </div>
                        </div>

                        <div className="text-xs font-mono font-bold text-white tabular-nums">
                          {formatPeso(exp.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: DAILY GRID & ROLLOVER ENGINE */}
          {activeTab === 'daily' && (
            <div className="animate-in fade-in duration-200">
              <DailyRolloverView
                rolloverSummary={rolloverSummary}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          )}

          {/* TAB 3: ITEMIZED SUB-LEGENDS */}
          {activeTab === 'sublegends' && (
            <div className="animate-in fade-in duration-200">
              <SubLegendsView
                initialSubTab={subLegendInitialTab}
                bills={bills}
                savings={savings}
                leisure={leisure}
                allocations={allocations}
                inflow={payPeriod.inflow}
                onUpdateBills={setBills}
                onUpdateSavings={setSavings}
                onUpdateLeisure={setLeisure}
              />
            </div>
          )}

          {/* TAB 4: KOTLIN ARCHITECTURE & SOURCE CODE */}
          {activeTab === 'code' && (
            <div className="animate-in fade-in duration-200">
              <KotlinSourceModal />
            </div>
          )}
        </main>

        {/* Movable / Draggable Floating Action Button with Long-Press & Boundary Clamping */}
        <MovableFab
          containerRef={containerRef}
          onTap={() => setIsQuickAddModalOpen(true)}
          navBarHeight={64}
        />

        {/* Material 3 Bottom Navigation Bar with Taskbar Inset Protection */}
        <M3NavigationBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadBillsCount={unpaidBillsCount}
        />

        {/* Modals */}
        <PayPeriodSetupModal
          isOpen={isPayPeriodModalOpen}
          currentPayPeriod={payPeriod}
          onClose={() => setIsPayPeriodModalOpen(false)}
          onSave={setPayPeriod}
        />

        <QuickAddTransactionModal
          isOpen={isQuickAddModalOpen}
          onClose={() => setIsQuickAddModalOpen(false)}
          payPeriod={payPeriod}
          currentDayLimit={todayCalculation?.calculatedLimit || 0}
          onAddExpense={handleAddExpense}
        />
      </div>
    </AndroidFrame>
  );
}
