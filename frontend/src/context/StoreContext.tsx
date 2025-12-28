import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Book, Customer, ImportTicket, Invoice, PaymentReceipt, SystemRules, Notification } from '../types';
import { getAllBooks as fetchBooksFromApi, deleteBookApi, updateBook as updateBookApi, createBook as createBookApi } from '../services/bookService';
import { getAllCustomers as fetchCustomersFromApi, updateCustomerApi, createCustomer as createCustomerApi, deleteCustomerApi } from '../services/customerService';
import { getAllRules as fetchRulesFromApi, updateRulesApi } from '../services/rulesService';

// Default rules in case API fails
const DEFAULT_RULES: SystemRules = {
  minImportQuantity: 150,
  maxStockBeforeImport: 300,
  maxCustomerDebt: 20000,
  minStockAfterSale: 20,
  usePaymentRule: true,
};

interface StoreContextType {
  books: Book[];
  customers: Customer[];
  rules: SystemRules;
  notifications: Notification[];
  importHistory: ImportTicket[];
  invoiceHistory: Invoice[];
  paymentHistory: PaymentReceipt[];
  isLoadingBooks: boolean;
  booksError: string | null;
  isLoadingCustomers: boolean;
  customersError: string | null;
  isLoadingRules: boolean;
  updateRules: (newRules: SystemRules) => Promise<void>;
  refreshRules: () => Promise<void>;
  importBooks: (items: { bookDetails: Book; quantity: number }[]) => Promise<{ success: boolean; message: string }>;
  createInvoice: (customerId: string, items: { bookId: string; quantity: number }[]) => Promise<{ success: boolean; message: string; totalAmount: number; }>;
  collectMoney: (customerId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  // Helpers
  getBook: (id: string) => Book | undefined;
  getCustomer: (id: string) => Customer | undefined;
  // CRUD Books
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  refreshBooks: () => Promise<void>;
  // CRUD Customers
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationsAsRead: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [rules, setRules] = useState<SystemRules>(DEFAULT_RULES);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [importHistory, setImportHistory] = useState<ImportTicket[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceipt[]>([]);

  // Fetch books from API
  const refreshBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    setBooksError(null);
    try {
      const booksFromApi = await fetchBooksFromApi();
      setBooks(booksFromApi);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooksError('Không thể tải danh sách sách. Vui lòng kiểm tra kết nối server.');
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  // Fetch customers from API
  const refreshCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setCustomersError(null);
    try {
      const customersFromApi = await fetchCustomersFromApi();
      setCustomers(customersFromApi);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomersError('Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối server.');
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  // Fetch rules from API
  const refreshRules = useCallback(async () => {
    setIsLoadingRules(true);
    try {
      const rulesFromApi = await fetchRulesFromApi();
      setRules(rulesFromApi);
    } catch (error) {
      console.error('Error fetching rules:', error);
      // Keep default rules if API fails
    } finally {
      setIsLoadingRules(false);
    }
  }, []);

  // Load books, customers and rules on mount
  useEffect(() => {
    refreshBooks();
    refreshCustomers();
    refreshRules();
  }, [refreshBooks, refreshCustomers, refreshRules]);

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

  const updateRules = async (newRules: SystemRules) => {
    try {
      const updatedRules = await updateRulesApi(newRules);
      setRules(updatedRules);
    } catch (error) {
      console.error('Error updating rules:', error);
      // Still update local state for better UX
      setRules(newRules);
    }
  };

  // CRUD Books Operations
  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const updateBook = async (id: string, updatedFields: Partial<Book>) => {
    try {
      // Update in database
      await updateBookApi(id, {
        tenSach: updatedFields.title,
        giaBanLe: updatedFields.price,
        soLuongTon: updatedFields.stock,
        moTa: updatedFields.description,
        isbn: updatedFields.isbn,
      });
      // Update local state
      setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    } catch (error) {
      console.error('Error updating book:', error);
      // Still update local state for better UX
      setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await deleteBookApi(id);
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      // Still remove from local state for better UX
      setBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  // CRUD Customers Operations
  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer | null> => {
    try {
      const newCustomer = await createCustomerApi({
        tenKH: customerData.name,
        soDienThoai: customerData.phone,
        email: customerData.email,
      });
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  };

  const updateCustomer = async (id: string, updatedFields: Partial<Customer>) => {
    try {
      await updateCustomerApi(id, {
        tenKH: updatedFields.name,
        soDienThoai: updatedFields.phone,
        email: updatedFields.email,
      });
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    } catch (error) {
      console.error('Error updating customer:', error);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteCustomerApi(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  // BM1 & QĐ1 Logic: Import Books
  const importBooks = async (items: { bookDetails: Book; quantity: number }[]): Promise<{ success: boolean; message: string }> => {
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
    for (const item of items) {
      const idx = newBooks.findIndex(b => 
        b.id === item.bookDetails.id || 
        (b.title.toLowerCase() === item.bookDetails.title.toLowerCase() && b.author.toLowerCase() === item.bookDetails.author.toLowerCase())
      );
      if (idx > -1) {
        const newStock = newBooks[idx].stock + item.quantity;
        // Update in database
        try {
          await updateBookApi(newBooks[idx].id, {
            soLuongTon: newStock,
            giaBanLe: item.bookDetails.price,
          });
        } catch (error) {
          console.error('Error updating book stock:', error);
        }
        newBooks[idx].stock = newStock;
        newBooks[idx].price = item.bookDetails.price; 
      } else {
        // Create new book in database
        try {
          const createdBook = await createBookApi({
            tenSach: item.bookDetails.title,
            giaNhap: item.bookDetails.price * 0.7, // Estimate import price
            giaBanLe: item.bookDetails.price,
            soLuongTon: item.quantity,
            moTa: item.bookDetails.description,
            isbn: item.bookDetails.isbn,
          });
          newBooks.push(createdBook);
        } catch (error) {
          console.error('Error creating book:', error);
          const newBook = { ...item.bookDetails, stock: item.quantity };
          newBooks.push(newBook);
        }
      }
    }

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
  const createInvoice = async (customerId: string, items: { bookId: string; quantity: number }[]): Promise<{ success: boolean; message: string; totalAmount: number }> => {
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
    const invoiceItems = [];
    
    for (const item of items) {
      const idx = newBooks.findIndex(b => b.id === item.bookId);
      const book = newBooks[idx];
      
      const newStock = newBooks[idx].stock - item.quantity;
      // Update stock in database
      try {
        await updateBookApi(book.id, { soLuongTon: newStock });
      } catch (error) {
        console.error('Error updating book stock:', error);
      }
      
      newBooks[idx].stock = newStock;
      totalAmount += book.price * item.quantity;

      invoiceItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: book.price
      });
    }
    
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
  const collectMoney = async (customerId: string, amount: number): Promise<{ success: boolean; message: string }> => {
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
      paymentHistory,
      isLoadingBooks,
      booksError,
      isLoadingCustomers,
      customersError,
      isLoadingRules,
      updateRules,
      refreshRules,
      importBooks,
      createInvoice,
      collectMoney,
      getBook,
      getCustomer,
      addBook,
      updateBook,
      deleteBook,
      refreshBooks,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      refreshCustomers,
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
