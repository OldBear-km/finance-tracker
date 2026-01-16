import { useState } from 'react';
import { Category, CategoryType } from '../types';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';

interface CategoriesManagerProps {
  categories: Category[];
  onCreateCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoriesManager({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoriesManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'expense' as CategoryType });
  const [filter, setFilter] = useState<CategoryType | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Пожалуйста, введите название категории');
      return;
    }

    if (editingId) {
      onUpdateCategory(editingId, { name: formData.name, type: formData.type });
      setEditingId(null);
    } else {
      onCreateCategory({
        name: formData.name,
        type: formData.type,
      });
      setIsCreating(false);
    }
    
    setFormData({ name: '', type: 'expense' });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, type: category.type });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту категорию? Операции останутся без категории.')) {
      onDeleteCategory(id);
    }
  };

  const filteredCategories = filter === 'all' 
    ? categories 
    : categories.filter(c => c.type === filter);

  const getTypeLabel = (type: CategoryType) => {
    switch (type) {
      case 'income': return 'Доход';
      case 'expense': return 'Расход';
      case 'savings': return 'Накопления';
    }
  };

  const getTypeColor = (type: CategoryType) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-700';
      case 'expense': return 'bg-red-100 text-red-700';
      case 'savings': return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Категории</h1>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            setFormData({ name: '', type: 'expense' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать категорию
        </button>
      </div>

      {/* Фильтр */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Доходы
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Расходы
          </button>
          <button
            onClick={() => setFilter('savings')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'savings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Накопления
          </button>
        </div>
      </div>

      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Редактировать категорию' : 'Новая категория'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название категории
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Продукты"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип категории
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CategoryType })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Доход</option>
                <option value="expense">Расход</option>
                <option value="savings">Накопления</option>
              </select>
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
                  setFormData({ name: '', type: 'expense' });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Tag className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTypeColor(category.type)}`}>
                    {getTypeLabel(category.type)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Изменить
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Категорий пока нет. Создайте первую категорию для начала работы.'
              : `Категорий типа "${getTypeLabel(filter as CategoryType)}" не найдено.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
