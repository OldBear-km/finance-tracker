
from dataclasses import dataclass
from decimal import Decimal

@dataclass
class Account:
    """Модель данных для счета."""
    id: int
    name: str
    balance: Decimal
    is_active: bool = True
