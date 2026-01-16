
import tkinter as tk
from tkinter import ttk

class FinanceTracker(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("FinanceTrecker")
        self.geometry("800x600")
        
        # Create a label
        self.label = ttk.Label(self, text="Welcome to FinanceTrecker!")
        self.label.pack(pady=10)

if __name__ == "__main__":
    app = FinanceTracker()
    app.mainloop()
