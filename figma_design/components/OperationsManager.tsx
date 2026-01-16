import { useState, useMemo, useEffect } from 'react';
import { Operation, Account, Category, OperationType } from '../types';
import { Plus, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';

interface OperationsManagerProps {
  operations: Operation[];
  accounts: Account[];
  categories: Category[];
  onCreateOperation: (operation: Omit<Operation, 'id' | 'createdAt'>) => void;
  onUpdateOperation: (id: string, updates: Partial<Operation>) => void;
  onDeleteOperation: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'type';
type SortOrder = 'asc' | 'desc';

export function OperationsManager({
  operations,
  accounts,
  categories,
  onCreateOperation,
  onUpdateOperation,
  onDeleteOperation,
}: OperationsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'expense' as OperationType,
    amount: '',
    accountId: '',
    categoryId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<OperationType | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Сортировка
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Обработчик клавиши Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedOperation && !isCreating && !editingId) {
        handleDelete(selectedOperation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOperation, isCreating, editingId]);

  const availableCategories = useMemo(() => {
    if (formData.type === 'income') {
      return categories.filter(c => c.type === 'income');
    } else if (formData.type === 'expense') {
      return categories.filter(c => c.type === 'expense');
    } else if (formData.type === 'transfer') {
      return categories.filter(c => c.type === 'savings');
    }
    return [];
  }, [categories, formData.type]);

  const filteredAndSortedOperations = useMemo(() => {
    let filtered = operations.filter(op => {
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const account = accounts.find(a => a.id === op.accountId);
        const category = categories.find(c => c.id === op.categoryId);
        const matchesNote = op.note?.toLowerCase().includes(query);
        const matchesAccount = account?.name.toLowerCase().includes(query);
        const matchesCategory = category?.name.toLowerCase().includes(query);
        
        if (!matchesNote && !matchesAccount && !matchesCategory) {
          return false;
        }
      }

      // Фильтр по дате
      if (dateFrom && op.date < dateFrom) return false;
      if (dateTo && op.date > dateTo) return false;

      // Фильтр по типу
      if (typeFilter !== 'all' && op.type !== typeFilter) return false;

      // Фильтр по счёту
      if (accountFilter !== 'all' && op.accountId !== accountFilter) return false;

      // Фильтр по категории
      if (categoryFilter !== 'all' && op.categoryId !== categoryFilter) return false;

      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [operations, accounts, categories, searchQuery, dateFrom, dateTo, typeFilter, accountFilter, categoryFilter, sortField, sortOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (!formData.accountId || isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    if (formData.type === 'transfer' && !formData.toAccountId) {
      alert('Выберите счёт получателя для перевода');
      return;
    }

    if (formData.type !== 'transfer' && !formData.categoryId) {
      alert('Выберите категорию');
      return;
    }

    const operationData = {
      type: formData.type,
      amount: Number(amount.toFixed(2)),
      accountId: formData.accountId,
      categoryId: formData.type !== 'transfer' ? formData.categoryId : undefined,
      toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
      date: formData.date,
      note: formData.note || undefined,
    };

    if (editingId) {
      onUpdateOperation(editingId, operationData);
      setEditingId(null);
    } else {
      onCreateOperation(operationData);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      accountId: accounts.find(a => a.isActive)?.id || '',
      categoryId: '',
      toAccountId: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleEdit = (operation: Operation) => {
    setEditingId(operation.id);
    setFormData({
      type: operation.type,
      amount: operation.amount.toString(),
      accountId: operation.accountId,
      categoryId: operation.categoryId || '',
      toAccountId: operation.toAccountId || '',
      date: operation.date,
      note: operation.note || '',
    });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту операцию?')) {
      onDeleteOperation(id);
      setSelectedOperation(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getTypeLabel = (type: OperationType) => {
    switch (type) {
      case 'income': return 'Доход';
      case 'expense': return 'Расход';
      case 'transfer': return 'Перевод';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Операции</h1>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить операцию
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Редактировать операцию' : 'Новая операция'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип операции
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as OperationType, categoryId: '' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income">Доход</option>
                  <option value="expense">Расход</option>
                  <option value="transfer">Перевод (Накопления)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'transfer' ? 'Счёт отправителя' : 'Счёт'}
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите счёт</option>
                  {accounts.filter(a => a.isActive).map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.balance.toFixed(2)} ₽)
                    </option>
                  ))}
                </select>
              </div>

              {formData.type === 'transfer' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Счёт получателя
                  </label>
                  <select
                    value={formData.toAccountId}
                    onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.filter(a => a.isActive && a.id !== formData.accountId).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.balance.toFixed(2)} ₽)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
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
                    {availableCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заметка (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Описание операции"
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
                  resetForm();
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Поиск по операциям..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Дата от</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Дата до</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Тип</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OperationType | 'all')}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
              <option value="transfer">Переводы</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Счёт</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Категория</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Таблица операций */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Дата
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Тип
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Счёт
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Сумма
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Заметка
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedOperations.map(operation => {
                const account = accounts.find(a => a.id === operation.accountId);
                const category = categories.find(c => c.id === operation.categoryId);
                const toAccount = accounts.find(a => a.id === operation.toAccountId);

                return (
                  <tr
                    key={operation.id}
                    onClick={() => setSelectedOperation(operation.id)}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedOperation === operation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(operation.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          operation.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : operation.type === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {getTypeLabel(operation.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {category?.name || (operation.type === 'transfer' ? `→ ${toAccount?.name}` : '—')}
                    </td>
                    <td className="px-4 py-3 text-sm">{account?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      <span
                        className={
                          operation.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {operation.type === 'income' ? '+' : '-'}
                        {operation.amount.toFixed(2)} ₽
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {operation.note || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(operation);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(operation.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedOperations.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              {operations.length === 0
                ? 'Операций пока нет. Добавьте первую операцию.'
                : 'По заданным фильтрам операций не найдено.'}
            </p>
          </div>
        )}
      </div>

      {filteredAndSortedOperations.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Показано операций: {filteredAndSortedOperations.length} из {operations.length}
          {selectedOperation && ' • Нажмите Delete для удаления выбранной операции'}
        </div>
      )}
    </div>
  );
}
