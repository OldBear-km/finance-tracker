
from dataclasses import dataclass
from enum import Enum

class OperationType(Enum):
    """Тип операции: доход, расход, перевод."""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

@dataclass
class Category:
    """Модель данных для категории."""
    id: int
    name: str
    operation_type: OperationType
