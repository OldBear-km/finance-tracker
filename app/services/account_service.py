
from decimal import Decimal
from typing import List, Optional

from app.db.database import get_db_connection
from app.models.account import Account

class AccountService:
    """Сервис для управления счетами с использованием БД."""

    def create_account(self, name: str, initial_balance: str) -> Account:
        """Создает новый счет в БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO accounts (name, balance) VALUES (?, ?)", 
            (name, initial_balance)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return Account(id=new_id, name=name, balance=Decimal(initial_balance), is_active=True)

    def get_account(self, account_id: int) -> Optional[Account]:
        """Возвращает счет по ID из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return Account(**dict(row))
        return None

    def get_all_accounts(self) -> List[Account]:
        """Возвращает все счета из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts")
        rows = cursor.fetchall()
        conn.close()
        return [Account(**dict(row)) for row in rows]

    def update_account(self, account_id: int, new_name: str, is_active: bool) -> Optional[Account]:
        """Обновляет данные счета в БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE accounts SET name = ?, is_active = ? WHERE id = ?",
            (new_name, is_active, account_id)
        )
        conn.commit()
        updated_rows = cursor.rowcount
        conn.close()
        if updated_rows > 0:
            return self.get_account(account_id) # Возвращаем обновленные данные
        return None

    def delete_account(self, account_id: int) -> bool:
        """Удаляет счет из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        conn.commit()
        deleted_rows = cursor.rowcount
        conn.close()
        return deleted_rows > 0
