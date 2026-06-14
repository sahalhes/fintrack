export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: Date;
  note?: string;
  createdAt: Date;
}

export const TRANSACTION_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Travel',
  'Entertainment',
  'Salary',
  'Freelance',
  'Other',
] as const;

export type PresetTransactionCategory = typeof TRANSACTION_CATEGORIES[number];
