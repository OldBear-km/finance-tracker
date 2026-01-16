// Типы для приложения FinanceTrecker

export type OperationType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense' | 'savings';

export interface Account {
  id: string;
  name: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  createdAt: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;
  accountId: string;
  categoryId?: string;
  toAccountId?: string; // для переводов (накоплений)
  date: string;
  note?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // формат: YYYY-MM
  limit: number;
  createdAt: string;
}

export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
}
