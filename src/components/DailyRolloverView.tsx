import React, { useState } from 'react';
import { RolloverSummary } from '../utils/rolloverEngine';
import { DayCalculation, ExpenseItem } from '../types';
import { formatPeso } from '../utils/currency';
import { DayDetailModal } from './DayDetailModal';
import {
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Columns,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface DailyRolloverViewProps {
  rolloverSummary: RolloverSummary;
  onAddExpense: (date: string, description: string, amount: number, category: ExpenseItem['category']) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const DailyRolloverView: React.FC<DailyRolloverViewProps> = ({
  rolloverSummary,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayCalculation | null>(null);
  const [viewMode, setViewMode] = useState<'horizontal' | 'grid'>('horizontal');

  const { baseDailyAllowance, totalDays, totalDailyBudget, totalSpentSoFar, netRemainingBalance, days } =
    rolloverSummary;

  // Keep selectedDay synchronized with updated calculation when expenses change
  const activeDay = selectedDay ? days.find((d) => d.date === selectedDay.date) || selectedDay : null;

  return (
    <div className="space-y-4">
      {/* Engine Stats Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Daily Rollover Engine</h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>{totalDays} Total Days</span>
                <span>·</span>
                <span>Base: {formatPeso(baseDailyAllowance)}/day</span>
              </div>
            </div>
          </div>

          {/* Grid vs Horizontal Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <button
              type="button"
              onClick={() => setViewMode('horizontal')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Horizontal Carousel View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Calendar Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-medium">Daily Category Pool</span>
            <span className="text-xs font-bold text-white font-mono tabular-nums">
              {formatPeso(totalDailyBudget)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-medium">Spent to Date</span>
            <span className="text-xs font-bold text-rose-400 font-mono tabular-nums">
              {formatPeso(totalSpentSoFar)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-medium">Net Pool Left</span>
            <span
              className={`text-xs font-bold font-mono tabular-nums ${
                netRemainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPeso(netRemainingBalance)}
            </span>
          </div>
        </div>

        {/* Dynamic Explanation Note */}
        <div className="mt-3 text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Automatic Next-Day Rollover:</strong> Any unspent surplus automatically adds to tomorrow&apos;s limit; any overspending deficit is deducted directly from tomorrow&apos;s limit.
          </span>
        </div>
      </div>

      {/* Days List / Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-semibold text-slate-300">
            Pay Period Days (Day 1 to Day {totalDays})
          </span>
          <span className="text-[11px] text-slate-400">
            Tap day for details & breakdown
          </span>
        </div>

        {viewMode === 'horizontal' ? (
          /* Horizontal Scroll Strip */
          <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {days.map((day) => (
              <DayCard
                key={day.date}
                day={day}
                onClick={() => setSelectedDay(day)}
                isCompact
              />
            ))}
          </div>
        ) : (
          /* Full Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {days.map((day) => (
              <DayCard
                key={day.date}
                day={day}
                onClick={() => setSelectedDay(day)}
                isCompact={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      <DayDetailModal
        day={activeDay}
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onAddExpense={onAddExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
};

interface DayCardProps {
  day: DayCalculation;
  onClick: () => void;
  isCompact: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, onClick, isCompact }) => {
  const isSurplusRollover = day.rolloverToNextDay >= 0;

  // Determine status color indicator
  // Green = under budget, Red = over budget
  const statusColorClass = day.isUnderBudget
    ? 'border-emerald-500/40 bg-slate-900/90 hover:border-emerald-500'
    : 'border-rose-500/40 bg-slate-900/90 hover:border-rose-500';

  const indicatorDotClass = day.isUnderBudget ? 'bg-emerald-400' : 'bg-rose-400';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative group flex flex-col justify-between ${statusColorClass} ${
        isCompact ? 'w-44 shrink-0 shadow-md' : 'w-full shadow-sm'
      } ${day.isToday ? 'ring-2 ring-emerald-400' : ''}`}
    >
      {/* Top row: Day # and date */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${indicatorDotClass} ${
                day.totalSpent > 0 ? 'animate-pulse' : ''
              }`}
            />
            <span className="text-[11px] font-bold text-slate-200">
              Day {day.dayIndex}
            </span>
          </div>

          {day.isToday && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500 text-white">
              Today
            </span>
          )}
        </div>

        <div className="text-xs font-semibold text-white truncate">
          {day.dayOfWeek}, {day.formattedDate}
        </div>
      </div>

      {/* Middle row: Limit vs Spent */}
      <div className="my-2.5 space-y-1.5 text-xs bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[10px] text-slate-400">Limit</span>
          <span className="font-mono font-bold text-white tabular-nums">
            {formatPeso(day.calculatedLimit)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Spent</span>
          <span
            className={`font-mono font-bold tabular-nums ${
              day.totalSpent > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {formatPeso(day.totalSpent)}
          </span>
        </div>
      </div>

      {/* Bottom row: Rollover Amount to next day */}
      <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-800">
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          {isSurplusRollover ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-400" />
          )}
          <span>Rollover</span>
        </span>

        <span
          className={`font-mono font-bold tabular-nums text-[11px] ${
            isSurplusRollover ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatPeso(day.rolloverToNextDay, { showSign: true })}
        </span>
      </div>

      {/* Hover action hint */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};
