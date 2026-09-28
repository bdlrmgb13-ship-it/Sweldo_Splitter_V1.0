import React, { useState } from 'react';
import { X, Calendar, DollarSign, ArrowRight, Check } from 'lucide-react';
import { PayFrequency, PayPeriod, QuincenaHalf } from '../types';
import {
  computeMonthlyRange,
  computeQuincenaRange,
  formatShortMonthDay,
  getInclusiveDaysCount,
  parseDate,
  toIsoDate,
} from '../utils/dateCalculations';
import { formatPeso } from '../utils/currency';

interface PayPeriodSetupModalProps {
  currentPayPeriod: PayPeriod;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPeriod: PayPeriod) => void;
}

export const PayPeriodSetupModal: React.FC<PayPeriodSetupModalProps> = ({
  currentPayPeriod,
  isOpen,
  onClose,
  onSave,
}) => {
  const [frequency, setFrequency] = useState<PayFrequency>(currentPayPeriod.frequency);
  const [quincenaHalf, setQuincenaHalf] = useState<QuincenaHalf>(currentPayPeriod.quincenaHalf || 'first_half');
  const [startDate, setStartDate] = useState(currentPayPeriod.startDate);
  const [endDate, setEndDate] = useState(currentPayPeriod.endDate);
  const [inflow, setInflow] = useState<number>(currentPayPeriod.inflow);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Current year-month e.g. "2026-09"
    return currentPayPeriod.startDate.substring(0, 7);
  });

  if (!isOpen) return null;

  // Handle frequency switches
  const handleSelectFrequency = (freq: PayFrequency) => {
    setFrequency(freq);
    const dateForMonth = parseDate(`${selectedMonth}-01`);

    if (freq === 'quincena') {
      const range = computeQuincenaRange(dateForMonth, quincenaHalf);
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (freq === 'monthly') {
      const range = computeMonthlyRange(dateForMonth);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  const handleQuincenaHalfChange = (half: QuincenaHalf) => {
    setQuincenaHalf(half);
    const dateForMonth = parseDate(`${selectedMonth}-01`);
    const range = computeQuincenaRange(dateForMonth, half);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const handleMonthChange = (monthStr: string) => {
    setSelectedMonth(monthStr);
    const dateForMonth = parseDate(`${monthStr}-01`);
    if (frequency === 'quincena') {
      const range = computeQuincenaRange(dateForMonth, quincenaHalf);
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (frequency === 'monthly') {
      const range = computeMonthlyRange(dateForMonth);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  // Quick preset for cross-month range (e.g. Sept 20 to Oct 5)
  const applyPresetSept20Oct5 = () => {
    setFrequency('custom');
    setStartDate('2026-09-20');
    setEndDate('2026-10-05');
  };

  const totalDays = getInclusiveDaysCount(startDate, endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseDate(endDate) < parseDate(startDate)) {
      return;
    }
    onSave({
      frequency,
      quincenaHalf: frequency === 'quincena' ? quincenaHalf : undefined,
      startDate,
      endDate,
      inflow: Math.max(0, inflow),
    });
    onClose();
  };

  const isValidRange = parseDate(endDate) >= parseDate(startDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Pay Period & Salary Setup</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Salary Inflow Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Net Inflow (Take-Home Salary)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-lg select-none">
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={inflow || ''}
                onChange={(e) => setInflow(parseFloat(e.target.value) || 0)}
                placeholder="15000"
                className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                required
              />
            </div>

            {/* Quick Inflow Presets */}
            <div className="flex items-center gap-2 mt-2">
              {[10000, 15000, 20000, 25000, 35000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInflow(preset)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                    inflow === preset
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ₱{(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Pay Frequency Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pay Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleSelectFrequency('monthly')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  frequency === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => handleSelectFrequency('quincena')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  frequency === 'quincena'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quincena (15th)
              </button>
              <button
                type="button"
                onClick={() => handleSelectFrequency('custom')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  frequency === 'custom'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Quincena Half Sub-Selector */}
          {frequency === 'quincena' && (
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-2.5">
              <div className="text-xs text-slate-300 font-medium">Select Quincena Period:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuincenaHalfChange('first_half')}
                  className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                    quincenaHalf === 'first_half'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-white">1st - 15th</div>
                  <div className="text-[10px] text-slate-400">First Payday</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuincenaHalfChange('second_half')}
                  className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                    quincenaHalf === 'second_half'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-white">16th - End of Month</div>
                  <div className="text-[10px] text-slate-400">Second Payday</div>
                </button>
              </div>

              {/* Month selector for Quincena */}
              <div className="pt-1">
                <label className="text-[11px] text-slate-400 block mb-1">Target Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Monthly Month Selector */}
          {frequency === 'monthly' && (
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Selected Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Custom Date Range Picker */}
          {frequency === 'custom' && (
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Cross-Month Date Range</span>
                <button
                  type="button"
                  onClick={applyPresetSept20Oct5}
                  className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Preset: Sep 20 – Oct 5
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date Calculation Summary (ChronoUnit.DAYS) */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-semibold">Calculated Cycle Days:</span>
              <span className="font-mono font-bold text-sm text-emerald-200">
                {isValidRange ? `${totalDays} Days` : 'Invalid Range'}
              </span>
            </div>

            <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1.5">
              <span>{formatShortMonthDay(startDate)}</span>
              <ArrowRight className="w-3 h-3 inline" />
              <span>{formatShortMonthDay(endDate)}</span>
              <span className="text-slate-400">·</span>
              <span>{formatPeso(inflow)} total inflow</span>
            </div>

            {!isValidRange && (
              <p className="text-xs text-rose-400 mt-2">
                End date must be on or after start date.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidRange}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
