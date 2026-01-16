
from datetime import date
from decimal import Decimal
from typing import List, Optional

from app.db.database import get_db_connection
from app.models.operation import Operation, OperationType

class OperationService:

    def add_operation(
        self, 
        amount: float, 
        description: str, 
        account_id: int, 
        category_id: int, 
        operation_type: OperationType, 
        operation_date: date = date.today()
    ) -> Optional[Operation]:
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("BEGIN TRANSACTION")

            cursor.execute("SELECT balance FROM accounts WHERE id = ?", (account_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Счет с ID {account_id} не найден.")
            
            current_balance = Decimal(row['balance'])
            operation_amount = Decimal(amount)

            if operation_type == OperationType.EXPENSE:
                new_balance = current_balance - operation_amount
            elif operation_type == OperationType.INCOME:
                new_balance = current_balance + operation_amount

            cursor.execute("UPDATE accounts SET balance = ? WHERE id = ?", (str(new_balance), account_id))

            cursor.execute(
                "INSERT INTO operations (amount, operation_type, operation_date, category_id, account_id, notes) VALUES (?, ?, ?, ?, ?, ?)",
                (str(amount), operation_type.value, operation_date.isoformat(), category_id, account_id, description)
            )
            new_op_id = cursor.lastrowid

            conn.commit()

            return Operation(
                id=new_op_id, 
                amount=operation_amount, 
                operation_type=operation_type, 
                operation_date=operation_date, 
                category_id=category_id, 
                account_id=account_id, 
                notes=description
            )

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_all_operations(self) -> List[Operation]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM operations ORDER BY operation_date DESC")
        rows = cursor.fetchall()
        conn.close()
        return [
            Operation(
                id=row['id'],
                amount=Decimal(row['amount']),
                operation_type=OperationType(row['operation_type']),
                operation_date=date.fromisoformat(row['operation_date']),
                category_id=row['category_id'],
                account_id=row['account_id'],
                notes=row['notes']
            ) for row in rows
        ]
