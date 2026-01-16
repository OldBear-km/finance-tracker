// Сервис для работы с localStorage
import { Account, Category, Operation, Budget } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'financetracker_accounts',
  CATEGORIES: 'financetracker_categories',
  OPERATIONS: 'financetracker_operations',
  BUDGETS: 'financetracker_budgets',
};

// Инициализация начальных данных
const initializeDefaultData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    const defaultAccounts: Account[] = [
      {
        id: '1',
        name: 'Основной счёт',
        balance: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const defaultCategories: Category[] = [
      { id: '1', name: 'Зарплата', type: 'income', createdAt: new Date().toISOString() },
      { id: '2', name: 'Продукты', type: 'expense', createdAt: new Date().toISOString() },
      { id: '3', name: 'Транспорт', type: 'expense', createdAt: new Date().toISOString() },
      { id: '4', name: 'Накопления', type: 'savings', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem(STORAGE_KEYS.OPERATIONS)) {
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  }
};

// Общие функции для работы с хранилищем
const getItems = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const setItems = <T>(key: string, items: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// API для счетов
export const accountsAPI = {
  getAll: (): Account[] => getItems<Account>(STORAGE_KEYS.ACCOUNTS),
  
  create: (account: Omit<Account, 'id' | 'createdAt'>): Account => {
    const accounts = getItems<Account>(STORAGE_KEYS.ACCOUNTS);
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    setItems(STORAGE_KEYS.ACCOUNTS, accounts);
    return newAccount;
  },
  
  update: (id: string, updates: Partial<Account>): Account | null => {
    const accounts = getItems<Account>(STORAGE_KEYS.ACCOUNTS);
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    accounts[index] = { ...accounts[index], ...updates };
    setItems(STORAGE_KEYS.ACCOUNTS, accounts);
    return accounts[index];
  },
  
  delete: (id: string): boolean => {
    const accounts = getItems<Account>(STORAGE_KEYS.ACCOUNTS);
    const filtered = accounts.filter(a => a.id !== id);
    if (filtered.length === accounts.length) return false;
    
    setItems(STORAGE_KEYS.ACCOUNTS, filtered);
    return true;
  },
};

// API для категорий
export const categoriesAPI = {
  getAll: (): Category[] => getItems<Category>(STORAGE_KEYS.CATEGORIES),
  
  create: (category: Omit<Category, 'id' | 'createdAt'>): Category => {
    const categories = getItems<Category>(STORAGE_KEYS.CATEGORIES);
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    setItems(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },
  
  update: (id: string, updates: Partial<Category>): Category | null => {
    const categories = getItems<Category>(STORAGE_KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    categories[index] = { ...categories[index], ...updates };
    setItems(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },
  
  delete: (id: string): boolean => {
    const categories = getItems<Category>(STORAGE_KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    
    setItems(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },
};

// API для операций
export const operationsAPI = {
  getAll: (): Operation[] => getItems<Operation>(STORAGE_KEYS.OPERATIONS),
  
  create: (operation: Omit<Operation, 'id' | 'createdAt'>): Operation => {
    const operations = getItems<Operation>(STORAGE_KEYS.OPERATIONS);
    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    operations.push(newOperation);
    setItems(STORAGE_KEYS.OPERATIONS, operations);
    
    // Обновляем баланс счетов
    updateAccountBalances(newOperation);
    
    return newOperation;
  },
  
  update: (id: string, updates: Partial<Operation>): Operation | null => {
    const operations = getItems<Operation>(STORAGE_KEYS.OPERATIONS);
    const index = operations.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    const oldOperation = operations[index];
    
    // Откатываем старую операцию
    reverseAccountBalances(oldOperation);
    
    operations[index] = { ...operations[index], ...updates };
    setItems(STORAGE_KEYS.OPERATIONS, operations);
    
    // Применяем новую операцию
    updateAccountBalances(operations[index]);
    
    return operations[index];
  },
  
  delete: (id: string): boolean => {
    const operations = getItems<Operation>(STORAGE_KEYS.OPERATIONS);
    const operation = operations.find(o => o.id === id);
    if (!operation) return false;
    
    // Откатываем операцию из баланса
    reverseAccountBalances(operation);
    
    const filtered = operations.filter(o => o.id !== id);
    setItems(STORAGE_KEYS.OPERATIONS, filtered);
    return true;
  },
};

// API для бюджетов
export const budgetsAPI = {
  getAll: (): Budget[] => getItems<Budget>(STORAGE_KEYS.BUDGETS),
  
  create: (budget: Omit<Budget, 'id' | 'createdAt'>): Budget => {
    const budgets = getItems<Budget>(STORAGE_KEYS.BUDGETS);
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    budgets.push(newBudget);
    setItems(STORAGE_KEYS.BUDGETS, budgets);
    return newBudget;
  },
  
  update: (id: string, updates: Partial<Budget>): Budget | null => {
    const budgets = getItems<Budget>(STORAGE_KEYS.BUDGETS);
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    budgets[index] = { ...budgets[index], ...updates };
    setItems(STORAGE_KEYS.BUDGETS, budgets);
    return budgets[index];
  },
  
  delete: (id: string): boolean => {
    const budgets = getItems<Budget>(STORAGE_KEYS.BUDGETS);
    const filtered = budgets.filter(b => b.id !== id);
    if (filtered.length === budgets.length) return false;
    
    setItems(STORAGE_KEYS.BUDGETS, filtered);
    return true;
  },
};

// Вспомогательные функции для обновления балансов
const updateAccountBalances = (operation: Operation) => {
  const accounts = getItems<Account>(STORAGE_KEYS.ACCOUNTS);
  
  if (operation.type === 'income') {
    const account = accounts.find(a => a.id === operation.accountId);
    if (account) {
      account.balance = Number((account.balance + operation.amount).toFixed(2));
    }
  } else if (operation.type === 'expense') {
    const account = accounts.find(a => a.id === operation.accountId);
    if (account) {
      account.balance = Number((account.balance - operation.amount).toFixed(2));
    }
  } else if (operation.type === 'transfer' && operation.toAccountId) {
    const fromAccount = accounts.find(a => a.id === operation.accountId);
    const toAccount = accounts.find(a => a.id === operation.toAccountId);
    if (fromAccount && toAccount) {
      fromAccount.balance = Number((fromAccount.balance - operation.amount).toFixed(2));
      toAccount.balance = Number((toAccount.balance + operation.amount).toFixed(2));
    }
  }
  
  setItems(STORAGE_KEYS.ACCOUNTS, accounts);
};

const reverseAccountBalances = (operation: Operation) => {
  const accounts = getItems<Account>(STORAGE_KEYS.ACCOUNTS);
  
  if (operation.type === 'income') {
    const account = accounts.find(a => a.id === operation.accountId);
    if (account) {
      account.balance = Number((account.balance - operation.amount).toFixed(2));
    }
  } else if (operation.type === 'expense') {
    const account = accounts.find(a => a.id === operation.accountId);
    if (account) {
      account.balance = Number((account.balance + operation.amount).toFixed(2));
    }
  } else if (operation.type === 'transfer' && operation.toAccountId) {
    const fromAccount = accounts.find(a => a.id === operation.accountId);
    const toAccount = accounts.find(a => a.id === operation.toAccountId);
    if (fromAccount && toAccount) {
      fromAccount.balance = Number((fromAccount.balance + operation.amount).toFixed(2));
      toAccount.balance = Number((toAccount.balance - operation.amount).toFixed(2));
    }
  }
  
  setItems(STORAGE_KEYS.ACCOUNTS, accounts);
};

// Инициализация при импорте
initializeDefaultData();
