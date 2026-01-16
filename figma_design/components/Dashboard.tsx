import { useMemo } from 'react';
import { Account, Operation, Budget, Category, BudgetProgress } from '../types';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface DashboardProps {
  accounts: Account[];
  operations: Operation[];
  budgets: Budget[];
  categories: Category[];
}

export function Dashboard({ accounts, operations, budgets, categories }: DashboardProps) {
  const stats = useMemo(() => {
    const activeAccounts = accounts.filter(a => a.isActive);
    const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthOperations = operations.filter(op => op.date.startsWith(currentMonth));
    
    const monthIncome = monthOperations
      .filter(op => op.type === 'income')
      .reduce((sum, op) => sum + op.amount, 0);
    
    const monthExpenses = monthOperations
      .filter(op => op.type === 'expense')
      .reduce((sum, op) => sum + op.amount, 0);
    
    return {
      totalBalance: totalBalance.toFixed(2),
      monthIncome: monthIncome.toFixed(2),
      monthExpenses: monthExpenses.toFixed(2),
      accountsCount: activeAccounts.length,
    };
  }, [accounts, operations]);

  const budgetProgress = useMemo((): BudgetProgress[] => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthBudgets = budgets.filter(b => b.month === currentMonth);
    
    return monthBudgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      if (!category) {
        return {
          budget,
          category: { id: '', name: 'Неизвестная категория', type: 'expense', createdAt: '' },
          spent: 0,
          remaining: budget.limit,
          percentage: 0,
        };
      }
      
      const monthOperations = operations.filter(
        op => op.date.startsWith(currentMonth) &&
              op.categoryId === budget.categoryId &&
              (op.type === 'expense' || (op.type === 'transfer' && category.type === 'savings'))
      );
      
      const spent = monthOperations.reduce((sum, op) => sum + op.amount, 0);
      const remaining = budget.limit - spent;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      
      return {
        budget,
        category,
        spent,
        remaining,
        percentage,
      };
    });
  }, [budgets, operations, categories]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Сводка</h1>
      
      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Общий баланс</p>
              <p className="text-2xl font-bold">{stats.totalBalance} ₽</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Доходы за месяц</p>
              <p className="text-2xl font-bold text-green-600">{stats.monthIncome} ₽</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Расходы за месяц</p>
              <p className="text-2xl font-bold text-red-600">{stats.monthExpenses} ₽</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Активных счетов</p>
              <p className="text-2xl font-bold">{stats.accountsCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Бюджеты */}
      {budgetProgress.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Бюджеты на текущий месяц</h2>
          </div>
          <div className="p-6 space-y-4">
            {budgetProgress.map(({ budget, category, spent, remaining, percentage }) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-600">
                    {spent.toFixed(2)} / {budget.limit.toFixed(2)} ₽
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={remaining < 0 ? 'text-red-600' : 'text-gray-600'}>
                    Остаток: {remaining.toFixed(2)} ₽
                  </span>
                  <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Последние операции */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Последние операции</h2>
        </div>
        <div className="p-6">
          {operations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Операций пока нет</p>
          ) : (
            <div className="space-y-3">
              {operations.slice(-5).reverse().map(op => {
                const account = accounts.find(a => a.id === op.accountId);
                const category = categories.find(c => c.id === op.categoryId);
                
                return (
                  <div key={op.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">
                        {category?.name || (op.type === 'transfer' ? 'Перевод' : 'Без категории')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {account?.name} • {new Date(op.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        op.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {op.type === 'income' ? '+' : '-'}{op.amount.toFixed(2)} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
