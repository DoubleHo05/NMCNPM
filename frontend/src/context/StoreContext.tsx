import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Book, Customer, ImportTicket, Invoice, PaymentReceipt, SystemRules, Notification } from '../types';
import { INITIAL_BOOKS, INITIAL_CUSTOMERS, INITIAL_RULES } from '../constants';

interface StoreContextType {
  books: Book[];
  customers: Customer[];
  rules: SystemRules;
  notifications: Notification[];
  importHistory: ImportTicket[];
  invoiceHistory: Invoice[];
  paymentHistory: PaymentReceipt[]; // Added payment history
  updateRules: (newRules: SystemRules) => void;
  importBooks: (items: { bookDetails: Book; quantity: number }[]) => { success: boolean; message: string };
  createInvoice: (customerId: string, items: { bookId: string; quantity: number }[]) => { success: boolean; message: string; totalAmount: number; };
  collectMoney: (customerId: string, amount: number) => { success: boolean; message: string };
  // Helpers
  getBook: (id: string) => Book | undefined;
  getCustomer: (id: string) => Customer | undefined;
  // CRUD Books
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationsAsRead: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [rules, setRules] = useState<SystemRules>(INITIAL_RULES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [importHistory, setImportHistory] = useState<ImportTicket[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceipt[]>([]);

  // --- NOTIFICATION HANDLERS ---
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setTimeout(() => {
      setNotifications(prev => prev.map(n => n.isRead ? n : { ...n, isRead: true }));
    }, 500); // Add a small delay for better UX
  };

  const updateRules = (newRules: SystemRules) => {
    setRules(newRules);
  };

  // CRUD Books Operations
  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  // BM1 & QĐ1 Logic: Import Books
  const importBooks = (items: { bookDetails: Book; quantity: number }[]) => {
    for (const item of items) {
      if (item.quantity < rules.minImportQuantity) {
        return { success: false, message: `QĐ1 Vi phạm: Sách "${item.bookDetails.title}" nhập ${item.quantity} (Tối thiểu ${rules.minImportQuantity})` };
      }
      const existingBook = books.find(b =>
        b.id === item.bookDetails.id ||
        (b.title.toLowerCase() === item.bookDetails.title.toLowerCase() && b.author.toLowerCase() === item.bookDetails.author.toLowerCase())
      );
      if (existingBook && existingBook.stock >= rules.maxStockBeforeImport) {
        return { success: false, message: `QĐ1 Vi phạm: Sách "${existingBook.title}" tồn ${existingBook.stock} (Chỉ nhập khi tồn ít hơn ${rules.maxStockBeforeImport})` };
      }
    }

    const newBooks = [...books];
    items.forEach(item => {
      const idx = newBooks.findIndex(b =>
        b.id === item.bookDetails.id ||
        (b.title.toLowerCase() === item.bookDetails.title.toLowerCase() && b.author.toLowerCase() === item.bookDetails.author.toLowerCase())
      );
      if (idx > -1) {
        newBooks[idx].stock += item.quantity;
        newBooks[idx].price = item.bookDetails.price;
      } else {
        const newBook = { ...item.bookDetails, stock: item.quantity };
        newBooks.push(newBook);
      }
    });

    const newTicket: ImportTicket = {
      id: `PN-${Date.now()}`,
      date: new Date().toISOString(),
      items: items.map(item => ({
        bookId: item.bookDetails.id,
        quantity: item.quantity,
      })),
    };
    setImportHistory(prev => [newTicket, ...prev]);

    setBooks(newBooks);
    return { success: true, message: 'Nhập sách và cập nhật kho thành công!' };
  };

  // BM2 & QĐ2 Logic: Sell Books
  const createInvoice = (customerId: string, items: { bookId: string; quantity: number }[]) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return { success: false, message: 'Khách hàng không tồn tại', totalAmount: 0 };

    if (customer.currentDebt > rules.maxCustomerDebt) {
      return { success: false, message: `QĐ2 Vi phạm: Khách đang nợ ${customer.currentDebt.toLocaleString()}đ (Tối đa ${rules.maxCustomerDebt.toLocaleString()}đ)`, totalAmount: 0 };
    }

    for (const item of items) {
      const book = books.find(b => b.id === item.bookId);
      if (!book) return { success: false, message: 'Sách không tồn tại', totalAmount: 0 };

      const stockAfter = book.stock - item.quantity;
      if (stockAfter < 0) {
        return { success: false, message: `Không đủ hàng: Sách "${book.title}" chỉ còn ${book.stock}`, totalAmount: 0 };
      }
      if (stockAfter < rules.minStockAfterSale) {
        return { success: false, message: `QĐ2 Vi phạm: Sách "${book.title}" tồn sau bán là ${stockAfter} (Tối thiểu ${rules.minStockAfterSale})`, totalAmount: 0 };
      }
    }

    let totalAmount = 0;
    const newBooks = [...books];
    const invoiceItems = items.map(item => {
      const idx = newBooks.findIndex(b => b.id === item.bookId);
      const book = newBooks[idx];

      newBooks[idx].stock -= item.quantity;
      totalAmount += book.price * item.quantity;

      return {
        bookId: item.bookId,
        quantity: item.quantity,
        price: book.price // Capture price at time of sale
      };
    });

    const newCustomers = [...customers];
    const custIdx = newCustomers.findIndex(c => c.id === customerId);
    if (custIdx > -1) {
      newCustomers[custIdx].currentDebt += totalAmount;
    }

    const newInvoice: Invoice = {
      id: `HD-${Date.now()}`,
      date: new Date().toISOString(),
      customerId,
      items: invoiceItems,
      totalAmount,
    };
    setInvoiceHistory(prev => [newInvoice, ...prev]);

    setBooks(newBooks);
    setCustomers(newCustomers);

    return { success: true, message: `Lập hóa đơn thành công!`, totalAmount };
  };

  // BM4 & QĐ4 Logic: Collect Money
  const collectMoney = (customerId: string, amount: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return { success: false, message: 'Khách hàng không tồn tại' };

    if (rules.usePaymentRule && amount > customer.currentDebt) {
      return { success: false, message: `QĐ4 Vi phạm: Số tiền thu (${amount.toLocaleString()}đ) vượt quá nợ (${customer.currentDebt.toLocaleString()}đ)` };
    }

    const newCustomers = [...customers];
    const idx = newCustomers.findIndex(c => c.id === customerId);
    if (idx > -1) {
      newCustomers[idx].currentDebt -= amount;
    }
    setCustomers(newCustomers);

    // Create and save payment receipt to history
    const newReceipt: PaymentReceipt = {
      id: `PT-${Date.now()}`,
      date: new Date().toISOString(),
      customerId,
      amount,
    };
    setPaymentHistory(prev => [newReceipt, ...prev]);

    return { success: true, message: 'Thu tiền thành công!' };
  };

  const getBook = (id: string) => books.find(b => b.id === id);
  const getCustomer = (id: string) => customers.find(c => c.id === id);

  return (
    <StoreContext.Provider value={{
      books,
      customers,
      rules,
      notifications,
      importHistory,
      invoiceHistory,
      paymentHistory, // Expose payment history
      updateRules,
      importBooks,
      createInvoice,
      collectMoney,
      getBook,
      getCustomer,
      addBook,
      updateBook,
      deleteBook,
      addNotification,
      markNotificationsAsRead
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
