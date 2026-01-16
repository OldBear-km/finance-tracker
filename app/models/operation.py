
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from enum import Enum

class OperationType(Enum):
    """Тип операции: доход или расход."""
    INCOME = "income"
    EXPENSE = "expense"

@dataclass
class Operation:
    """Модель данных для операции."""
    id: int
    amount: Decimal
    operation_type: OperationType
    operation_date: date
    category_id: int
    account_id: int
    notes: str = ""
