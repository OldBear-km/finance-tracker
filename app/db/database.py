
import sqlite3

DATABASE_FILE = "app/data/finance.db"

def get_db_connection():
    """Создает и возвращает соединение с базой данных."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row # Позволяет обращаться к колонкам по имени
    return conn

def create_tables():
    """Создает таблицы в базе данных, если они еще не созданы."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Таблица счетов
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            balance TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT 1
        );
    """)

    # Таблица категорий
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
    """)

    # Таблица операций
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount TEXT NOT NULL,
            operation_type TEXT NOT NULL CHECK(operation_type IN ('income', 'expense')),
            operation_date TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            account_id INTEGER NOT NULL,
            notes TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (account_id) REFERENCES accounts (id)
        );
    """)

    conn.commit()
    conn.close()
    print("Таблицы успешно созданы (или уже существовали).")
