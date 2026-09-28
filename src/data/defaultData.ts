import { Allocations, BillItem, ExpenseItem, LeisureItem, PayPeriod, SavingsItem } from '../types';

export const DEFAULT_PAY_PERIOD: PayPeriod = {
  frequency: 'custom',
  startDate: '2026-09-20',
  endDate: '2026-10-05',
  inflow: 15000,
};

export const DEFAULT_ALLOCATIONS: Allocations = {
  savings: 20,
  debtBills: 30,
  dailyExpenses: 30,
  leisure: 20,
};

export const DEFAULT_BILLS: BillItem[] = [
  {
    id: 'bill-1',
    name: 'Meralco Electricity',
    dueDate: '2026-09-26',
    target: 2100,
    isPaid: true,
    category: 'utility',
  },
  {
    id: 'bill-2',
    name: 'Maynilad Water',
    dueDate: '2026-09-28',
    target: 450,
    isPaid: true,
    category: 'utility',
  },
  {
    id: 'bill-3',
    name: 'Converge FiberX WiFi',
    dueDate: '2026-10-02',
    target: 1500,
    isPaid: false,
    category: 'telco',
  },
  {
    id: 'bill-4',
    name: 'Credit Card Minimum',
    dueDate: '2026-10-04',
    target: 450,
    isPaid: false,
    category: 'credit_card',
  },
];

export const DEFAULT_SAVINGS: SavingsItem[] = [
  {
    id: 'sav-1',
    name: 'Emergency Fund (BPI)',
    target: 50000,
    depositAmount: 1500,
  },
  {
    id: 'sav-2',
    name: 'Pag-IBIG MP2 Dividends',
    target: 30000,
    depositAmount: 1000,
  },
  {
    id: 'sav-3',
    name: 'Travel & Holiday Fund',
    target: 20000,
    depositAmount: 500,
  },
];

export const DEFAULT_LEISURE: LeisureItem[] = [
  {
    id: 'lei-1',
    activity: 'Weekend Samgyupsal / Dining Out',
    estimatedCost: 1200,
    status: 'spent',
  },
  {
    id: 'lei-2',
    activity: 'Netflix + Spotify Family Subscriptions',
    estimatedCost: 550,
    status: 'spent',
  },
  {
    id: 'lei-3',
    activity: 'Shopee Payday Sale Cart',
    estimatedCost: 800,
    status: 'reserved',
  },
  {
    id: 'lei-4',
    activity: 'Coffee Shop Work Sessions',
    estimatedCost: 450,
    status: 'reserved',
  },
];

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    date: '2026-09-20',
    description: 'MRT-3 Beep Card Reload',
    amount: 100,
    category: 'fare',
    timestamp: 1726815600000,
  },
  {
    id: 'exp-2',
    date: '2026-09-20',
    description: 'Jollibee 1pc Chickenjoy Lunch',
    amount: 120,
    category: 'food',
    timestamp: 1726828200000,
  },
  {
    id: 'exp-3',
    date: '2026-09-21',
    description: 'GrabCar ride (Heavy Rain)',
    amount: 210,
    category: 'fare',
    timestamp: 1726902000000,
  },
  {
    id: 'exp-4',
    date: '2026-09-21',
    description: 'Karinderya Dinner & Rice',
    amount: 90,
    category: 'food',
    timestamp: 1726914600000,
  },
  {
    id: 'exp-5',
    date: '2026-09-22',
    description: 'Mini Mart Groceries & Snacks',
    amount: 360,
    category: 'groceries',
    timestamp: 1726988400000,
  },
  {
    id: 'exp-6',
    date: '2026-09-23',
    description: 'City Bus Fare',
    amount: 45,
    category: 'fare',
    timestamp: 1727074800000,
  },
  {
    id: 'exp-7',
    date: '2026-09-23',
    description: 'Siomai Rice + Bottled Water',
    amount: 65,
    category: 'food',
    timestamp: 1727087400000,
  },
];
