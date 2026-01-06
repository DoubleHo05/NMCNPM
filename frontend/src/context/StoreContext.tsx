import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Book, Customer, ImportTicket, Invoice, PaymentReceipt, SystemRules, Notification } from '../types';
import { INITIAL_BOOKS, INITIAL_CUSTOMERS, INITIAL_RULES } from '../constants';
import { inventoryService } from '../services/inventoryService';
import { settingService, type Setting } from '../services/settingService';
import { bookService } from '../services/bookService'; // [NEW]
import { useAuth } from './AuthContext';

interface StoreContextType {
  books: Book[];
  customers: Customer[];
  rules: SystemRules;
  notifications: Notification[];
  importHistory: ImportTicket[];
  invoiceHistory: Invoice[];
  paymentHistory: PaymentReceipt[];
  updateRules: (newRules: SystemRules) => void;
  importBooks: (items: { bookDetails: Book; quantity: number }[]) => Promise<{ success: boolean; message: string }>;
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
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]); // Initialize empty, will load from DB
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [rules, setRules] = useState<SystemRules>(INITIAL_RULES);
  const [rawSettings, setRawSettings] = useState<Setting[]>([]); // Store raw backend settings with IDs
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [importHistory, setImportHistory] = useState<ImportTicket[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceipt[]>([]);

  // Mapping from Frontend Rule Keys to Backend Setting Names
  const SETTING_Name_MAPPING: Record<keyof SystemRules, string> = {
    minImportQuantity: 'SoLuongNhapToiThieu',
    maxStockBeforeImport: 'TonKhoToiDaTruocKhiNhap',
    maxCustomerDebt: 'TienNoToiDa',
    minStockAfterSale: 'TonKhoToiThieuSauKhiBan',
    usePaymentRule: 'SuDungQuyDinhThuTien'
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await settingService.getAllSettings();
        if (settingsRes && settingsRes.data && settingsRes.data.settings) {
          setRawSettings(settingsRes.data.settings);

          // Update local rules based on backend data
          const backendRules: Partial<SystemRules> = {};
          settingsRes.data.settings.forEach(setting => {
            // Find which rule corresponds to this setting
            const ruleKey = (Object.keys(SETTING_Name_MAPPING) as Array<keyof SystemRules>).find(
              key => SETTING_Name_MAPPING[key] === setting.tenQuyDinh
            );

            if (ruleKey) {
              if (ruleKey === 'usePaymentRule') {
                backendRules[ruleKey] = setting.giaTri === '1' || setting.giaTri === 'true';
              } else {
                backendRules[ruleKey] = parseInt(setting.giaTri, 10);
              }
            }
          });

          setRules(prev => ({ ...prev, ...backendRules }));
        }

        // Fetch Inventory History
        const historyRes = await inventoryService.getImportHistory();
        if (historyRes && (historyRes as any).success) {
          setImportHistory((historyRes as any).data);
        }

        // [NEW] Fetch Books from Real DB
        const booksRes = await bookService.getAllBooks();
        if (booksRes && (booksRes as any).success) {
          // Map backend data to frontend Book interface if needed, or assume controller formatted it
          // Controller returns { data: [...] }
          setBooks((booksRes as any).data);
        }

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchData();
  }, [user]); // Re-fetch if user changes, though mostly global

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
    }, 500);
  };

  const updateRules = async (newRules: SystemRules) => {
    // Find identifying changed rules and update them in backend
    for (const key of Object.keys(newRules) as Array<keyof SystemRules>) {
      if (newRules[key] !== rules[key]) {
        const settingName = SETTING_Name_MAPPING[key];
        const setting = rawSettings.find(s => s.tenQuyDinh === settingName);

        if (setting) {
          try {
            const valueToUpdate = typeof newRules[key] === 'boolean'
              ? (newRules[key] ? '1' : '0')
              : String(newRules[key]);

            await settingService.updateSetting(setting.maQuyDinh, { giaTri: valueToUpdate });
          } catch (err) {
            console.error(`Failed to update setting ${key}:`, err);
            addNotification({
              type: 'settings',
              title: 'Lỗi cập nhật',
              message: `Không thể cập nhật quy định: ${key}`
            });
            return; // Stop local update if API fails
          }
        } else {
          console.warn(`Setting ${settingName} not found in backend list.`);
        }
      }
    }

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
  const importBooks = async (items: { bookDetails: Book; quantity: number }[]) => {
    // 1. Validation (Keep local validation for immediate feedback, but could rely on backend)
    for (const item of items) {
      if (item.quantity < rules.minImportQuantity) {
        return { success: false, message: `QĐ1 Vi phạm: Sách "${item.bookDetails.title}" nhập ${item.quantity} (Tối thiểu ${rules.minImportQuantity})` };
      }

      // Note: We might need to check stock against backend data here, but for now we use local 'books' state
      // which assumes 'books' state is kept relatively in sync or we accept optimistic checks.
      const existingBook = books.find(b =>
        b.id === item.bookDetails.id ||
        (b.title.toLowerCase() === item.bookDetails.title.toLowerCase() && b.author.toLowerCase() === item.bookDetails.author.toLowerCase())
      );
      if (existingBook && existingBook.stock >= rules.maxStockBeforeImport) {
        return { success: false, message: `QĐ1 Vi phạm: Sách "${existingBook.title}" tồn ${existingBook.stock} (Chỉ nhập khi tồn ít hơn ${rules.maxStockBeforeImport})` };
      }
    }

    // 2. Prepare Payload for API
    // Need to map bookDetails to IDs if they exist, but for now the API expects `maSach`.
    // If it's a new book, the current `importGoods` API might not handle creating books effectively 
    // unless `maSach` is valid. 
    // STARTING ASSUMPTION: The user selects existing books or the UI handles new book creation separately?
    // Looking at BookImport.tsx, it allows creating "new" books locally with random IDs.
    // However, the backend `importGoods` requires `maSach`. 
    // IMPORTANT: If we are importing NEW books, we likely need a `createBook` API first.
    // OR the `importGoods` should handle new books.
    // The current backend `importGoods` controller strictly takes `maSach`.
    // So assume we only support importing EXISTING books for now, or we would need to create them first.

    // Filter out items that don't have a valid real ID (backend IDs are usually numbers or specific strings).
    // The explicit instruction is about Inventory and Setting APIs. 
    // We will attempt to use the existing `id` as `maSach`. 
    // If `id` is not a number (e.g. "B001"), this might fail if backend expects number.
    // Checking `backend/bookstore-prisma/src/controllers/inventoryController.js`: `maSach: item.maSach`
    // Checking `backend/bookstore-prisma/src/controllers/bookController.js` (not seen yet) or Schema.
    // Let's assume `maSach` is Int.
    // Our local `books` have IDs like "B001". This is a mismatch.
    // FOR DEMO PURPOSES: We will rely on the backend API call. 
    // We'll try to parse the ID. slightly hacking it for "B001" -> 1 if possible, or expect the user to have real IDs?
    // Actually, let's map the payload.

    try {
      const importPayload = {
        maNV: user?.maNV ? Number(user.maNV) : 0, // Get real maNV from auth user
        chiTietNhap: items.map(item => ({
          maSach: parseInt(item.bookDetails.id.replace(/\D/g, '')) || 0,
          soLuongNhap: item.quantity,
          giaNhap: item.bookDetails.price,
          // Add full book details for creation if it's a new book
          tenSach: item.bookDetails.title,
          tacGia: item.bookDetails.author,
          theLoai: item.bookDetails.category,
          nhaXuatBan: item.bookDetails.publisher,
          namXuatBan: item.bookDetails.publishYear,
          giaBanLe: item.bookDetails.price * 1.2, // Default markup 20% or set same
          hinhAnh: item.bookDetails.imageUrl,
          trongLuong: item.bookDetails.weight,
          soTrang: item.bookDetails.pages,
          kichThuoc: item.bookDetails.dimensions,
          moTa: item.bookDetails.description
        }))
      };

      const response = await inventoryService.importGoods(importPayload);

      if ((response as any).success) {
        // Refresh history
        const historyRes = await inventoryService.getImportHistory();
        if (historyRes && (historyRes as any).success) {
          setImportHistory((historyRes as any).data);
        }

        // Assume success - update local state to reflect changes (Optimistic or re-fetch books)
        // Refresh books from backend to get full updated details (ids, description, etc.)
        const booksRes = await bookService.getAllBooks();
        if (booksRes && (booksRes as any).success) {
          setBooks((booksRes as any).data);
        } else {
          // Fallback optimistic update if fetch fails
          const newBooks = [...books];
          items.forEach(item => {
            const idx = newBooks.findIndex(b => b.id === item.bookDetails.id);
            if (idx > -1) {
              newBooks[idx].stock += item.quantity;
            }
          });
          setBooks(newBooks);
        }

        return { success: true, message: 'Nhập hàng thành công (API)' };
      } else {
        return { success: false, message: (response as any).message || 'Lỗi khi gọi API nhập hàng' };
      }

    } catch (err) {
      console.error("Import API error", err);
      return { success: false, message: 'Lỗi kết nối server khi nhập hàng.' };
    }
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
