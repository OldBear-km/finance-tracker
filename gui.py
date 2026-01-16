
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from app.services.account_service import AccountService
from app.services.category_service import CategoryService
from app.services.operation_service import OperationService
from app.models.operation import OperationType

class FinanceApp(tk.Tk):
    def __init__(self, account_service, category_service, operation_service):
        super().__init__()
        self.title("Finance Tracker")
        self.geometry("800x600")

        self.account_service = account_service
        self.category_service = category_service
        self.operation_service = operation_service

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(pady=10, padx=10, fill="both", expand=True)

        self.create_accounts_tab()
        self.create_operations_tab()
        self.create_add_operation_tab()

    def create_accounts_tab(self):
        self.accounts_frame = ttk.Frame(self.notebook, width=780, height=580)
        self.notebook.add(self.accounts_frame, text="Счета")

        self.accounts_tree = ttk.Treeview(self.accounts_frame, columns=("ID", "Name", "Balance"), show="headings")
        self.accounts_tree.heading("ID", text="ID")
        self.accounts_tree.heading("Name", text="Название")
        self.accounts_tree.heading("Balance", text="Баланс")
        self.accounts_tree.pack(fill="both", expand=True)
        self.refresh_accounts()

    def create_operations_tab(self):
        self.operations_frame = ttk.Frame(self.notebook, width=780, height=580)
        self.notebook.add(self.operations_frame, text="Операции")

        self.operations_tree = ttk.Treeview(self.operations_frame, columns=("ID", "Date", "Type", "Amount", "Desc", "Account", "Category"), show="headings")
        self.operations_tree.heading("ID", text="ID")
        self.operations_tree.heading("Date", text="Дата")
        self.operations_tree.heading("Type", text="Тип")
        self.operations_tree.heading("Amount", text="Сумма")
        self.operations_tree.heading("Desc", text="Описание")
        self.operations_tree.heading("Account", text="Счет")
        self.operations_tree.heading("Category", text="Категория")
        self.operations_tree.pack(fill="both", expand=True)
        self.refresh_operations()

    def create_add_operation_tab(self):
        self.add_operation_frame = ttk.Frame(self.notebook, width=780, height=580)
        self.notebook.add(self.add_operation_frame, text="Добавить операцию")

        ttk.Label(self.add_operation_frame, text="Тип операции:").grid(row=0, column=0, padx=10, pady=5, sticky="w")
        self.operation_type = ttk.Combobox(self.add_operation_frame, values=["income", "expense"])
        self.operation_type.grid(row=0, column=1, padx=10, pady=5, sticky="ew")
        self.operation_type.current(0)

        ttk.Label(self.add_operation_frame, text="Сумма:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.amount_entry = ttk.Entry(self.add_operation_frame)
        self.amount_entry.grid(row=1, column=1, padx=10, pady=5, sticky="ew")

        ttk.Label(self.add_operation_frame, text="Описание:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.description_entry = ttk.Entry(self.add_operation_frame)
        self.description_entry.grid(row=2, column=1, padx=10, pady=5, sticky="ew")

        ttk.Label(self.add_operation_frame, text="Счет:").grid(row=3, column=0, padx=10, pady=5, sticky="w")
        self.account_combobox = ttk.Combobox(self.add_operation_frame)
        self.account_combobox.grid(row=3, column=1, padx=10, pady=5, sticky="ew")

        ttk.Label(self.add_operation_frame, text="Категория:").grid(row=4, column=0, padx=10, pady=5, sticky="w")
        self.category_combobox = ttk.Combobox(self.add_operation_frame)
        self.category_combobox.grid(row=4, column=1, padx=10, pady=5, sticky="ew")

        self.refresh_comboboxes()

        add_button = ttk.Button(self.add_operation_frame, text="Добавить", command=self.add_operation)
        add_button.grid(row=5, column=0, columnspan=2, pady=20)

    def refresh_accounts(self):
        for i in self.accounts_tree.get_children():
            self.accounts_tree.delete(i)
        for acc in self.account_service.get_all_accounts():
            self.accounts_tree.insert("", "end", values=(acc.id, acc.name, acc.balance))

    def refresh_operations(self):
        for i in self.operations_tree.get_children():
            self.operations_tree.delete(i)
        for op in self.operation_service.get_all_operations():
            self.operations_tree.insert("", "end", values=(op.id, op.date, op.operation_type.value, op.amount, op.description, op.account_id, op.category_id))

    def refresh_comboboxes(self):
        accounts = self.account_service.get_all_accounts()
        self.account_combobox['values'] = [f"{acc.id}: {acc.name}" for acc in accounts]

        categories = self.category_service.get_all_categories()
        self.category_combobox['values'] = [f"{cat.id}: {cat.name}" for cat in categories]

    def add_operation(self):
        try:
            op_type = OperationType(self.operation_type.get())
            amount = float(self.amount_entry.get())
            description = self.description_entry.get()
            account_id = int(self.account_combobox.get().split(':')[0])
            category_id = int(self.category_combobox.get().split(':')[0])

            self.operation_service.add_operation(
                amount=amount,
                description=description,
                account_id=account_id,
                category_id=category_id,
                operation_type=op_type
            )
            messagebox.showinfo("Success", "Операция успешно добавлена")
            self.refresh_all()
            self.amount_entry.delete(0, tk.END)
            self.description_entry.delete(0, tk.END)
        except Exception as e:
            messagebox.showerror("Error", f"Произошла ошибка: {e}")
    
    def refresh_all(self):
        self.refresh_accounts()
        self.refresh_operations()
        self.refresh_comboboxes()

if __name__ == "__main__":
    account_service = AccountService()
    category_service = CategoryService()
    operation_service = OperationService()
    
    app = FinanceApp(account_service, category_service, operation_service)
    app.mainloop()
