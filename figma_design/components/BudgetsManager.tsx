import { useState, useMemo } from 'react';
import { Budget, Category, Operation, BudgetProgress } from '../types';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';

interface BudgetsManagerProps {
  budgets: Budget[];
  categories: Category[];
  operations: Operation[];
  onCreateBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetsManager({
  budgets,
  categories,
  operations,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    month: new Date().toISOString().slice(0, 7),
    limit: '',
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const budgetableCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense' || c.type === 'savings');
  }, [categories]);

  const budgetProgress = useMemo((): BudgetProgress[] => {
    const monthBudgets = budgets.filter(b => b.month === selectedMonth);
    
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
        op => op.date.startsWith(selectedMonth) &&
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
  }, [budgets, operations, categories, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const limit = parseFloat(formData.limit);
    if (!formData.categoryId || !formData.month || isNaN(limit) || limit <= 0) {
      alert('Пожалуйста, заполните все поля корректно');
      return;
    }

    // Проверка на существующий бюджет
    const existing = budgets.find(
      b => b.categoryId === formData.categoryId && 
           b.month === formData.month && 
           b.id !== editingId
    );
    
    if (existing) {
      alert('Бюджет для этой категории на выбранный месяц уже существует');
      return;
    }

    if (editingId) {
      onUpdateBudget(editingId, {
        categoryId: formData.categoryId,
        month: formData.month,
        limit: Number(limit.toFixed(2)),
      });
      setEditingId(null);
    } else {
      onCreateBudget({
        categoryId: formData.categoryId,
        month: formData.month,
        limit: Number(limit.toFixed(2)),
      });
      setIsCreating(false);
    }
    
    setFormData({
      categoryId: '',
      month: new Date().toISOString().slice(0, 7),
      limit: '',
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      categoryId: budget.categoryId,
      month: budget.month,
      limit: budget.limit.toString(),
    });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот бюджет?')) {
      onDeleteBudget(id);
    }
  };

  const getMonthName = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Бюджеты</h1>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            setFormData({
              categoryId: '',
              month: new Date().toISOString().slice(0, 7),
              limit: '',
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать бюджет
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Редактировать бюджет' : 'Новый бюджет'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {budgetableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type === 'expense' ? 'Расход' : 'Накопления'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Месяц
                </label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Лимит (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({
                    categoryId: '',
                    month: new Date().toISOString().slice(0, 7),
                    limit: '',
                  });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Выбор месяца */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Месяц:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">{getMonthName(selectedMonth)}</span>
        </div>
      </div>

      {/* Список бюджетов */}
      {budgetProgress.length > 0 ? (
        <div className="space-y-4">
          {budgetProgress.map(({ budget, category, spent, remaining, percentage }) => (
            <div key={budget.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    percentage > 100 ? 'bg-red-100' : 
                    percentage > 80 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      percentage > 100 ? 'text-red-600' : 
                      percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {category.type === 'expense' ? 'Расход' : 'Накопления'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Прогресс</span>
                  <span className="font-semibold">
                    {spent.toFixed(2)} / {budget.limit.toFixed(2)} ₽
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all flex items-center justify-end px-2 ${
                      percentage > 100 ? 'bg-red-600' : 
                      percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  >
                    {percentage >= 20 && (
                      <span className="text-xs text-white font-semibold">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-600">Остаток: </span>
                    <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {remaining.toFixed(2)} ₽
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${
                      percentage > 100 ? 'text-red-600' : 
                      percentage > 80 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {percentage > 100 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ Превышение бюджета на {Math.abs(remaining).toFixed(2)} ₽
                    </p>
                  </div>
                )}

                {percentage > 80 && percentage <= 100 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">
                      ⚡ Внимание: использовано более 80% бюджета
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {budgets.length === 0
              ? 'Бюджетов пока нет. Создайте первый бюджет для контроля расходов.'
              : `Нет бюджетов на ${getMonthName(selectedMonth)}.`}
          </p>
        </div>
      )}
    </div>
  );
}
