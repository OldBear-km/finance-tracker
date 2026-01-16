
from datetime import date
from decimal import Decimal
from typing import List, Optional

from app.db.database import get_db_connection
from app.models.operation import Operation
from app.services.account_service import AccountService
from app.services.category_service import CategoryService # Импортируем, чтобы получить тип операции

class OperationService:
    """Сервис для управления финансовыми операциями с использованием БД."""

    def __init__(self, account_service: AccountService, category_service: CategoryService):
        self.account_service = account_service
        self.category_service = category_service

    def create_operation(
        self, 
        amount: str, 
        operation_date: date, 
        category_id: int, 
        account_id: int, 
        notes: str = ""
    ) -> Optional[Operation]:
        """Создает новую операцию, используя транзакцию для обновления баланса и записи операции."""
        # 1. Получаем категорию, чтобы узнать тип операции (доход/расход)
        category = next((cat for cat in self.category_service.get_all_categories() if cat.id == category_id), None)
        if not category:
            print(f"Ошибка: Категория с ID {category_id} не найдена.")
            return None

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 2. Начинаем транзакцию
            cursor.execute("BEGIN TRANSACTION")

            # 3. Получаем текущий баланс счета
            cursor.execute("SELECT balance FROM accounts WHERE id = ?", (account_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Счет с ID {account_id} не найден.")
            
            current_balance = Decimal(row['balance'])
            operation_amount = Decimal(amount)

            # 4. Вычисляем новый баланс в зависимости от типа операции
            if category.operation_type.value == 'expense':
                new_balance = current_balance - operation_amount
            elif category.operation_type.value == 'income':
                new_balance = current_balance + operation_amount
            else: # transfer
                # TODO: Логика для переводов будет сложнее
                raise NotImplementedError("Переводы пока не поддерживаются.")

            # 5. Обновляем баланс счета
            cursor.execute("UPDATE accounts SET balance = ? WHERE id = ?", (str(new_balance), account_id))

            # 6. Создаем запись об операции
            cursor.execute(
                "INSERT INTO operations (amount, operation_date, category_id, account_id, notes) VALUES (?, ?, ?, ?, ?)",
                (amount, operation_date.isoformat(), category_id, account_id, notes)
            )
            new_op_id = cursor.lastrowid

            # 7. Завершаем транзакцию
            conn.commit()

            print(f"Операция (ID: {new_op_id}) успешно создана. Новый баланс счета {account_id}: {new_balance:.2f}")
            return Operation(id=new_op_id, amount=operation_amount, operation_date=operation_date, category_id=category_id, account_id=account_id, notes=notes)

        except (ValueError, sqlite3.Error) as e:
            print(f"Ошибка транзакции: {e}. Откат изменений.")
            conn.rollback()
            return None
        finally:
            conn.close()

    def get_operations_by_account(self, account_id: int) -> List[Operation]:
        """Возвращает все операции для счета из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM operations WHERE account_id = ? ORDER BY operation_date DESC", (account_id,))
        rows = cursor.fetchall()
        conn.close()
        return [Operation(**dict(row)) for row in rows]
