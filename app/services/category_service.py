
from typing import List

from app.db.database import get_db_connection
from app.models.category import Category, OperationType

class CategoryService:
    """Сервис для управления категориями с использованием БД."""

    def create_category(self, name: str, operation_type: OperationType) -> Category:
        """Создает новую категорию в БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO categories (name, operation_type) VALUES (?, ?)", 
            (name, operation_type.value)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return Category(id=new_id, name=name, operation_type=operation_type)

    def get_all_categories(self) -> List[Category]:
        """Возвращает все категории из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categories")
        rows = cursor.fetchall()
        conn.close()
        # Преобразуем строки в объекты Enum перед созданием объекта Category
        categories = []
        for row in rows:
            row_dict = dict(row)
            row_dict['operation_type'] = OperationType(row_dict['operation_type'])
            categories.append(Category(**row_dict))
        return categories

    def get_categories_by_type(self, operation_type: OperationType) -> List[Category]:
        """Возвращает категории по типу операции из БД."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM categories WHERE operation_type = ?", 
            (operation_type.value,)
        )
        rows = cursor.fetchall()
        conn.close()
        categories = []
        for row in rows:
            row_dict = dict(row)
            row_dict['operation_type'] = OperationType(row_dict['operation_type'])
            categories.append(Category(**row_dict))
        return categories
