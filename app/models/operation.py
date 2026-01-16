
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

@dataclass
class Operation:
    """Модель данных для операции."""
    id: int
    amount: Decimal
    operation_date: date
    category_id: int
    account_id: int
    notes: str = ""
