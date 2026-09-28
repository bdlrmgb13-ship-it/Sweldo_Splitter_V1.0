import { DayCalculation, ExpenseItem, PayPeriod, Allocations } from '../types';
import {
  generateDateSequence,
  getInclusiveDaysCount,
  formatShortMonthDay,
  formatDayOfWeek,
  toIsoDate,
  parseDate,
} from './dateCalculations';

export interface RolloverSummary {
  baseDailyAllowance: number;
  totalDays: number;
  totalDailyBudget: number;
  totalSpentSoFar: number;
  netRemainingBalance: number;
  days: DayCalculation[];
}

export function computeDailyRollover(
  payPeriod: PayPeriod,
  allocations: Allocations,
  expenses: ExpenseItem[],
  referenceTodayStr?: string
): RolloverSummary {
  const totalDays = getInclusiveDaysCount(payPeriod.startDate, payPeriod.endDate);
  const totalDailyBudget = (payPeriod.inflow * allocations.dailyExpenses) / 100;
  const baseDailyAllowance = totalDays > 0 ? totalDailyBudget / totalDays : 0;

  const dates = generateDateSequence(payPeriod.startDate, payPeriod.endDate);
  const todayStr = referenceTodayStr || toIsoDate(new Date());
  const todayObj = parseDate(todayStr);

  const days: DayCalculation[] = [];
  let previousRollover = 0;
  let totalSpentSoFar = 0;

  dates.forEach((dateStr, index) => {
    const dayIndex = index + 1;
    const dateObj = parseDate(dateStr);

    const isToday = dateStr === todayStr;
    const isPast = dateObj < todayObj && !isToday;
    const isFuture = dateObj > todayObj && !isToday;

    // Filter transactions for this day
    const dayTransactions = expenses.filter((e) => e.date === dateStr);
    const daySpent = dayTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    totalSpentSoFar += daySpent;

    const carriedRollover = index === 0 ? 0 : previousRollover;
    const calculatedLimit = baseDailyAllowance + carriedRollover;
    const netRemaining = calculatedLimit - daySpent;

    // Rollover carried into the next day is the net remaining of this day
    const rolloverToNextDay = netRemaining;
    previousRollover = rolloverToNextDay;

    // Status: if spent is less than or equal to calculatedLimit, or no expenses logged yet
    const isUnderBudget = daySpent <= calculatedLimit;

    days.push({
      dayIndex,
      date: dateStr,
      formattedDate: formatShortMonthDay(dateStr),
      dayOfWeek: formatDayOfWeek(dateStr),
      baseLimit: baseDailyAllowance,
      carriedRollover,
      calculatedLimit,
      totalSpent: daySpent,
      netRemaining,
      rolloverToNextDay,
      isUnderBudget,
      isPast,
      isToday,
      isFuture,
      transactions: dayTransactions,
    });
  });

  const netRemainingBalance = totalDailyBudget - totalSpentSoFar;

  return {
    baseDailyAllowance,
    totalDays,
    totalDailyBudget,
    totalSpentSoFar,
    netRemainingBalance,
    days,
  };
}
