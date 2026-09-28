import React from 'react';
import { Allocations } from '../types';
import { formatPeso } from '../utils/currency';
import { CheckCircle2, AlertTriangle, RotateCcw, Scale } from 'lucide-react';

interface AllocationSettingsProps {
  allocations: Allocations;
  inflow: number;
  onChangeAllocations: (newAllocations: Allocations) => void;
  onOpenSubLegend?: (category: 'debtBills' | 'savings' | 'leisure') => void;
}

export const AllocationSettings: React.FC<AllocationSettingsProps> = ({
  allocations,
  inflow,
  onChangeAllocations,
  onOpenSubLegend,
}) => {
  const totalPercent =
    allocations.savings + allocations.debtBills + allocations.dailyExpenses + allocations.leisure;

  const isExact100 = totalPercent === 100;
  const isOver = totalPercent > 100;
  const isUnder = totalPercent < 100;

  const updateCategory = (key: keyof Allocations, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    onChangeAllocations({
      ...allocations,
      [key]: clamped,
    });
  };

  const handleAutoBalance = () => {
    if (totalPercent === 0) {
      onChangeAllocations({ savings: 20, debtBills: 30, dailyExpenses: 30, leisure: 20 });
      return;
    }

    const factor = 100 / totalPercent;
    let s = Math.round(allocations.savings * factor);
    let d = Math.round(allocations.debtBills * factor);
    let de = Math.round(allocations.dailyExpenses * factor);
    let l = 100 - (s + d + de);

    // If l went negative, adjust
    if (l < 0) {
      de += l;
      l = 0;
    }

    onChangeAllocations({
      savings: s,
      debtBills: d,
      dailyExpenses: de,
      leisure: l,
    });
  };

  const handleResetDefaults = () => {
    onChangeAllocations({
      savings: 20,
      debtBills: 30,
      dailyExpenses: 30,
      leisure: 20,
    });
  };

  const categories: {
    key: keyof Allocations;
    title: string;
    subtitle: string;
    color: string;
    sliderColor: string;
    subLegendKey?: 'debtBills' | 'savings' | 'leisure';
  }[] = [
    {
      key: 'savings',
      title: 'Savings',
      subtitle: 'Emergency, MP2, Travel',
      color: 'text-emerald-400',
      sliderColor: 'accent-emerald-500',
      subLegendKey: 'savings',
    },
    {
      key: 'debtBills',
      title: 'Debt / Fixed Bills',
      subtitle: 'Meralco, WiFi, Credit Card',
      color: 'text-violet-400',
      sliderColor: 'accent-violet-500',
      subLegendKey: 'debtBills',
    },
    {
      key: 'dailyExpenses',
      title: 'Daily Expenses',
      subtitle: 'Food, Fare, Daily Limit Pool',
      color: 'text-sky-400',
      sliderColor: 'accent-sky-500',
    },
    {
      key: 'leisure',
      title: 'Leisure / Wants',
      subtitle: 'Dining, Shopping, Fun',
      color: 'text-amber-400',
      sliderColor: 'accent-amber-500',
      subLegendKey: 'leisure',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header and Total Validation Pill */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Percentage Allocation</h2>
          <p className="text-[11px] text-slate-400">Total must equal 100% of income</p>
        </div>

        {/* Validation Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isExact100
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isOver
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {isExact100 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Balanced</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {totalPercent}% Total {isOver ? `(+${totalPercent - 100}%)` : `(-${100 - totalPercent}%)`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${allocations.savings}%` }}
          className="bg-emerald-500 transition-all duration-300"
          title={`Savings: ${allocations.savings}%`}
        />
        <div
          style={{ width: `${allocations.debtBills}%` }}
          className="bg-violet-500 transition-all duration-300"
          title={`Bills: ${allocations.debtBills}%`}
        />
        <div
          style={{ width: `${allocations.dailyExpenses}%` }}
          className="bg-sky-500 transition-all duration-300"
          title={`Daily: ${allocations.dailyExpenses}%`}
        />
        <div
          style={{ width: `${allocations.leisure}%` }}
          className="bg-amber-500 transition-all duration-300"
          title={`Leisure: ${allocations.leisure}%`}
        />
      </div>

      {/* Allocation Items */}
      <div className="space-y-3.5 pt-1">
        {categories.map((cat) => {
          const percent = allocations[cat.key];
          const pesoValue = (inflow * percent) / 100;

          return (
            <div
              key={cat.key}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${cat.color}`}>{cat.title}</span>
                    {cat.subLegendKey && onOpenSubLegend && (
                      <button
                        type="button"
                        onClick={() => onOpenSubLegend(cat.subLegendKey!)}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors underline cursor-pointer"
                      >
                        view legend
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{cat.subtitle}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white tabular-nums">
                    {formatPeso(pesoValue)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-400">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percent}
                      onChange={(e) => updateCategory(cat.key, parseFloat(e.target.value) || 0)}
                      className="w-12 text-right bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={percent}
                onChange={(e) => updateCategory(cat.key, parseFloat(e.target.value))}
                className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer ${cat.sliderColor}`}
              />
            </div>
          );
        })}
      </div>

      {/* Action helpers */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset (20/30/30/20)</span>
        </button>

        {!isExact100 && (
          <button
            type="button"
            onClick={handleAutoBalance}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Auto-Balance to 100%</span>
          </button>
        )}
      </div>
    </div>
  );
};
