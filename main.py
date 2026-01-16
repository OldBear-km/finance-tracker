
from datetime import date
from decimal import Decimal

from app.db.database import create_tables
from app.models.category import OperationType
from app.services.account_service import AccountService
from app.services.category_service import CategoryService
from app.services.operation_service import OperationService

def main():
    """Главная функция приложения: демонстрация работы сервисов."""
    # 1. Убедимся, что таблицы в БД созданы
    create_tables()
    print("--- Инициализация сервисов ---")
    
    # 2. Инициализация сервисов
    account_service = AccountService()
    category_service = CategoryService()
    operation_service = OperationService(account_service, category_service)
    print("Сервисы успешно инициализированы.")

    # 3. Очистим старые данные для чистоты демонстрации (не для продакшена!)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM operations")
    cursor.execute("DELETE FROM accounts")
    cursor.execute("DELETE FROM categories")
    conn.commit()
    conn.close()
    print("--- Старые данные удалены для чистоты демонстрации ---")

    # 4. Создание категорий
    print("--- Создание категорий ---")
    cat_salary = category_service.create_category("Зарплата", OperationType.INCOME)
    cat_food = category_service.create_category("Продукты", OperationType.EXPENSE)
    cat_cafe = category_service.create_category("Кафе", OperationType.EXPENSE)

    # 5. Создание счетов
    print("\n--- Создание счетов ---")
    acc_cash = account_service.create_account("Наличные", "1000.00")
    acc_card = account_service.create_account("Банковская карта", "5000.00")

    # 6. Выполнение операций
    print("\n--- Проведение операций ---")
    # Поступление зарплаты на карту
    operation_service.create_operation(
        amount="50000.00",
        operation_date=date(2024, 7, 25),
        category_id=cat_salary.id,
        account_id=acc_card.id,
        notes="Аванс"
    )
    # Покупка продуктов наличными
    operation_service.create_operation(
        amount="1250.50",
        operation_date=date(2024, 7, 26),
        category_id=cat_food.id,
        account_id=acc_cash.id,
        notes="Продукты на неделю"
    )
    # Поход в кафе с оплатой картой
    operation_service.create_operation(
        amount="780.00",
        operation_date=date(2024, 7, 27),
        category_id=cat_cafe.id,
        account_id=acc_card.id
    )

    # 7. Вывод итоговой информации
    print("\n--- Итоговое состояние счетов ---")
    all_accounts = account_service.get_all_accounts()
    for acc in all_accounts:
        print(f"Счет: '{acc.name}', Баланс: {Decimal(acc.balance):.2f}")
    
    print("\n--- Последние операции по карте ---")
    card_ops = operation_service.get_operations_by_account(acc_card.id)
    for op in card_ops:
        print(f"Дата: {op.operation_date}, Сумма: {op.amount}, Заметки: {op.notes}")

if __name__ == "__main__":
    from app.db.database import get_db_connection # Локальный импорт
    main()
