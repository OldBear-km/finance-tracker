import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Account, Category, Operation, Budget } from './types';
import { accountsAPI, categoriesAPI, operationsAPI, budgetsAPI } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { AccountsManager } from './components/AccountsManager';
import { CategoriesManager } from './components/CategoriesManager';
import { OperationsManager } from './components/OperationsManager';
import { BudgetsManager } from './components/BudgetsManager';
import { LayoutDashboard, Wallet, Tag, Receipt, Target } from 'lucide-react';
import './styles/globals.css';

type View = 'dashboard' | 'accounts' | 'categories' | 'operations' | 'budgets';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAccounts(accountsAPI.getAll());
    setCategories(categoriesAPI.getAll());
    setOperations(operationsAPI.getAll());
    setBudgets(budgetsAPI.getAll());
  };

  // Обработчики для счетов
  const handleCreateAccount = (account: Omit<Account, 'id' | 'createdAt'>) => {
    accountsAPI.create(account);
    loadData();
  };

  const handleUpdateAccount = (id: string, updates: Partial<Account>) => {
    accountsAPI.update(id, updates);
    loadData();
  };

  // Обработчики для категорий
  const handleCreateCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    categoriesAPI.create(category);
    loadData();
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    categoriesAPI.update(id, updates);
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    categoriesAPI.delete(id);
    loadData();
  };

  // Обработчики для операций
  const handleCreateOperation = (operation: Omit<Operation, 'id' | 'createdAt'>) => {
    operationsAPI.create(operation);
    loadData();
  };

  const handleUpdateOperation = (id: string, updates: Partial<Operation>) => {
    operationsAPI.update(id, updates);
    loadData();
  };

  const handleDeleteOperation = (id: string) => {
    operationsAPI.delete(id);
    loadData();
  };

  // Обработчики для бюджетов
  const handleCreateBudget = (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    budgetsAPI.create(budget);
    loadData();
  };

  const handleUpdateBudget = (id: string, updates: Partial<Budget>) => {
    budgetsAPI.update(id, updates);
    loadData();
  };

  const handleDeleteBudget = (id: string) => {
    budgetsAPI.delete(id);
    loadData();
  };


  const navItems = [
    { id: 'dashboard' as View, label: 'Сводка', icon: LayoutDashboard },
    { id: 'operations' as View, label: 'Операции', icon: Receipt },
    { id: 'budgets' as View, label: 'Бюджеты', icon: Target },
    { id: 'accounts' as View, label: 'Счета', icon: Wallet },
    { id: 'categories' as View, label: 'Категории', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FinanceTracker</h1>
            </div>
            <div className="text-sm text-gray-600">
              Управление личными финансами
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Боковая панель навигации */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r">
          <nav className="p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard
                accounts={accounts}
                operations={operations}
                budgets={budgets}
                categories={categories}
              />
            )}

            {currentView === 'accounts' && (
              <AccountsManager
                accounts={accounts}
                onCreateAccount={handleCreateAccount}
                onUpdateAccount={handleUpdateAccount}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesManager
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {currentView === 'operations' && (
              <OperationsManager
                operations={operations}
                accounts={accounts}
                categories={categories}
                onCreateOperation={handleCreateOperation}
                onUpdateOperation={handleUpdateOperation}
                onDeleteOperation={handleDeleteOperation}
              />
            )}

            {currentView === 'budgets' && (
              <BudgetsManager
                budgets={budgets}
                categories={categories}
                operations={operations}
                onCreateBudget={handleCreateBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
