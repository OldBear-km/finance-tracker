import { useState } from 'react';
import { Account } from '../types';
import { Wallet, Plus, Edit2, Power, PowerOff } from 'lucide-react';

interface AccountsManagerProps {
  accounts: Account[];
  onCreateAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
}

export function AccountsManager({ accounts, onCreateAccount, onUpdateAccount }: AccountsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', balance: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const balance = parseFloat(formData.balance);
    if (!formData.name || isNaN(balance)) {
      alert('Пожалуйста, заполните все поля корректно');
      return;
    }

    if (editingId) {
      onUpdateAccount(editingId, { name: formData.name });
      setEditingId(null);
    } else {
      onCreateAccount({
        name: formData.name,
        balance: Number(balance.toFixed(2)),
        isActive: true,
      });
      setIsCreating(false);
    }
    
    setFormData({ name: '', balance: '' });
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setFormData({ name: account.name, balance: account.balance.toString() });
    setIsCreating(false);
  };

  const toggleActive = (account: Account) => {
    onUpdateAccount(account.id, { isActive: !account.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Счета</h1>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            setFormData({ name: '', balance: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать счёт
        </button>
      </div>

      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Редактировать счёт' : 'Новый счёт'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название счёта
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Основной счёт"
                required
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Начальный баланс (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            )}
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
                  setFormData({ name: '', balance: '' });
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
        {accounts.map(account => (
          <div
            key={account.id}
            className={`bg-white rounded-lg shadow p-6 ${!account.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${account.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Wallet className={`w-6 h-6 ${account.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-sm text-gray-500">
                    {account.isActive ? 'Активен' : 'Неактивен'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Баланс</p>
              <p className="text-2xl font-bold">{account.balance.toFixed(2)} ₽</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(account)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Изменить
              </button>
              <button
                onClick={() => toggleActive(account)}
                className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  account.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {account.isActive ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    Деактивировать
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    Активировать
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Счетов пока нет. Создайте первый счёт для начала работы.</p>
        </div>
      )}
    </div>
  );
}
