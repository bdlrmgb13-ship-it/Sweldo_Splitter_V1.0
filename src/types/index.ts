export type PayFrequency = 'monthly' | 'quincena' | 'custom';

export type QuincenaHalf = 'first_half' | 'second_half';

export interface PayPeriod {
  frequency: PayFrequency;
  quincenaHalf?: QuincenaHalf;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  inflow: number;    // e.g. 15000
}

export interface Allocations {
  savings: number;     // e.g. 20 (percent)
  debtBills: number;   // e.g. 30
  dailyExpenses: number; // e.g. 30
  leisure: number;     // e.g. 20
}

export interface ExpenseItem {
  id: string;
  date: string; // ISO YYYY-MM-DD
  description: string;
  amount: number;
  category: 'food' | 'fare' | 'groceries' | 'coffee' | 'medical' | 'misc';
  timestamp: number;
}

export interface BillItem {
  id: string;
  name: string;
  dueDate: string; // ISO YYYY-MM-DD or day of month
  target: number;
  isPaid: boolean;
  category?: 'utility' | 'credit_card' | 'loan' | 'telco' | 'other';
}

export interface SavingsItem {
  id: string;
  name: string;
  target: number;
  depositAmount: number;
  color?: string;
}

export interface LeisureItem {
  id: string;
  activity: string;
  estimatedCost: number;
  status: 'reserved' | 'spent';
}

export interface DayCalculation {
  dayIndex: number; // 1-based (Day 1, Day 2...)
  date: string;     // ISO YYYY-MM-DD
  formattedDate: string; // e.g. "Sep 20", "Oct 1"
  dayOfWeek: string;    // "Fri", "Sat", etc.
  baseLimit: number;
  carriedRollover: number; // from previous day (+ surplus, - deficit)
  calculatedLimit: number; // baseLimit + carriedRollover
  totalSpent: number;
  netRemaining: number;    // calculatedLimit - totalSpent
  rolloverToNextDay: number; // netRemaining
  isUnderBudget: boolean;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  transactions: ExpenseItem[];
}

export interface FabCoordinates {
  x: number;
  y: number;
}
