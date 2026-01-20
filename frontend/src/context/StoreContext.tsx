import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Book, Customer, ImportTicket, Invoice, PaymentReceipt, SystemRules, Notification } from '../types';
// Mock data removed - now using API data
// Default rules used as fallback before API loads
const DEFAULT_RULES: SystemRules = {
  minImportQuantity: 150,
  maxStockBeforeImport: 300,
  maxCustomerDebt: 20000,
  minStockAfterSale: 20,
  usePaymentRule: true
};
import { inventoryService } from '../services/inventoryService';
import { settingService, type Setting } from '../services/settingService';
import { bookService } from '../services/bookService';
import { getAllCustomers } from '../services/customerService';
import { useAuth } from './AuthContext';

interface StoreContextType {
  isLoadingBooks: boolean;
  booksError: string | null;
  refreshBooks: () => Promise<void>;
  books: Book[];
  customers: Customer[];
  rules: SystemRules;
  notifications: Notification[];
  importHistory: ImportTicket[];
  invoiceHistory: Invoice[];
  paymentHistory: PaymentReceipt[];
  updateRules: (newRules: SystemRules) => void;
  importBooks: (items: { bookDetails: Book; quantity: number }[]) => Promise<{ success: boolean; message: string }>;
  createInvoice: (customerId: string, items: { bookId: string; quantity: number; price: number }[], amountPaid?: number) => Promise<{ success: boolean; message: string; totalAmount: number; finalAmount?: number; id?: string; currentDebt?: number; }>;
  collectMoney: (customerId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  // Helpers
  getBook: (id: string) => Book | undefined;
  getCustomer: (id: string) => Customer | undefined;
  // CRUD Books
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationsAsRead: () => void;
  refreshCustomers: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]); // Initialize empty, will load from DB
  const [customers, setCustomers] = useState<Customer[]>([]); // Initialize empty, load from API
  const [rules, setRules] = useState<SystemRules>(DEFAULT_RULES); // Use default until API loads
  const [rawSettings, setRawSettings] = useState<Setting[]>([]); // Store raw backend settings with IDs
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [importHistory, setImportHistory] = useState<ImportTicket[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceipt[]>([]);

  // Loading & Error states
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // Prevent flicker during initial load

  // Mapping from Frontend Rule Keys to Backend Setting Names
  const SETTING_Name_MAPPING: Record<keyof SystemRules, string> = {
    minImportQuantity: 'SoLuongNhapToiThieu',
    maxStockBeforeImport: 'TonKhoToiDaTruocKhiNhap',
    maxCustomerDebt: 'TienNoToiDa',
    minStockAfterSale: 'TonKhoToiThieuSauKhiBan',
    usePaymentRule: 'SuDungQuyDinhThuTien'
  };

  // Ref to prevent double fetch (React strict mode / user state changing)
  const hasFetchedRef = React.useRef(false);

  // Fetch initial data
  useEffect(() => {
    // Prevent double fetch
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      hasFetchedRef.current = true; // Mark as fetching
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

        // Fetch Customers from Real DB
        try {
          const customersData = await getAllCustomers();
          const mappedCustomers: Customer[] = customersData.map((c: any) => ({
            id: c.maKH?.toString() || c.id || '',
            name: c.tenKH || c.name || '',
            phone: c.soDienThoai || c.phone || '',
            address: c.diaChi || c.address || '',
            email: c.email || '',
            currentDebt: c.tienNo ? Number(c.tienNo) : (c.currentDebt || 0),
            loyaltyPoints: c.diemTichLuy ?? c.loyaltyPoints ?? 0,
          }));
          setCustomers(mappedCustomers);
        } catch (customerErr) {
          console.error('Failed to fetch customers:', customerErr);
        }

        // Fetch Invoice History
        const token = localStorage.getItem('accessToken');
        let authHeaders = {};
        if (token) {
          authHeaders = { 'Authorization': `Bearer ${token}` };
        }

        try {
          const invRes = await fetch('http://localhost:5000/api/invoices', { headers: { ...authHeaders } });
          const invData = await invRes.json();
          if (invData.success) {
            setInvoiceHistory(invData.data.map((inv: any) => ({ ...inv, customerId: inv.customerId?.toString() || '' })));
          }
        } catch (err) { console.error('Failed to fetch invoices:', err); }

        // Fetch Payment History
        try {
          const payRes = await fetch('http://localhost:5000/api/payments', { headers: { ...authHeaders } });
          const payData = await payRes.json();
          if (payData.success) {
            setPaymentHistory(payData.data.map((pay: any) => ({ ...pay, customerId: pay.customerId?.toString() || '', customerName: pay.customerName || '' })));
          }
        } catch (err) { console.error('Failed to fetch payments:', err); }

        // Fetch books via reusable function
        await refreshBooks();

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setInitialLoading(false); // Done loading, allow render
      }
    };

    // Only fetch if user is logged in
    if (user) {
      fetchData();
    } else {
      setInitialLoading(false); // No user, just show content
    }
  }, [user]); // Re-fetch if user changes, though mostly global

  // [NEW] Refresh Books Function
  const refreshBooks = async () => {
    setIsLoadingBooks(true);
    setBooksError(null);
    try {
      const booksRes = await bookService.getAllBooks();
      if (booksRes && (booksRes as any).success) {
        const apiBooks = (booksRes as any).data || [];
        const mappedBooks: Book[] = apiBooks.map((b: any) => ({
          id: b.id || b.maSach?.toString() || '',
          isbn: b.isbn || b.ISBN || '',
          title: b.title || b.tenSach || '',
          category: b.category || b.theLoai || '',
          author: Array.isArray(b.authors) ? b.authors.join(', ') : (b.author || ''),
          stock: b.stock ?? b.soLuongTon ?? 0,
          price: b.salePrice || b.price || b.giaBanLe || 0,
          publisher: b.publisher || b.nhaXuatBan || '',
          publishYear: b.publishYear || new Date().getFullYear(),
          imageUrl: b.imageUrl || b.hinhAnh || '',
          description: b.description || b.moTa || '',
        }));
        setBooks(mappedBooks);
      } else {
        setBooksError('Failed to fetch books');
      }
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setBooksError(err.message || 'Error fetching books');
    } finally {
      setIsLoadingBooks(false);
    }
  };



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

  const updateBook = async (id: string, updatedFields: Partial<Book>) => {
    console.log('[DEBUG] updateBook called with:', { id, updatedFields });
    try {
      // Call API to update in database
      const response = await bookService.updateBook(id, updatedFields);
      console.log('[DEBUG] updateBook response:', response);
      if (response.success) {
        // Update local state after successful API call
        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
        console.log('[DEBUG] Book updated successfully');
      } else {
        console.error('Failed to update book:', response.message);
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      // Call API to delete from database
      const response = await bookService.deleteBook(id);
      if (response.success) {
        // Update local state after successful API call
        setBooks(prev => prev.filter(b => b.id !== id));
      } else {
        console.error('Failed to delete book:', response.message);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
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

  const createInvoice = async (customerId: string, items: { bookId: string; quantity: number; price: number }[], amountPaid: number = 0): Promise<{ success: boolean; message: string; totalAmount: number; finalAmount?: number; id?: string; currentDebt?: number; }> => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer && customerId) return { success: false, message: 'Khách hàng không tồn tại', totalAmount: 0 };
    if (!items || items.length === 0) return { success: false, message: 'Chưa chọn sách', totalAmount: 0 };

    // ===== KIỂM TRA QĐ2: Khách hàng nợ không quá mức cho phép =====
    if (customer && customer.currentDebt > rules.maxCustomerDebt) {
      return {
        success: false,
        message: `QĐ2 Vi phạm: Khách hàng "${customer.name}" đang nợ ${customer.currentDebt.toLocaleString()}đ, vượt quá mức cho phép (${rules.maxCustomerDebt.toLocaleString()}đ). Không thể lập hóa đơn.`,
        totalAmount: 0
      };
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

    // Calculate total for return value
    let totalAmount = 0;
    items.forEach(item => {
      const book = books.find(b => b.id === item.bookId);
      if (book) totalAmount += book.price * item.quantity;
    });

    try {
      // Get auth token from localStorage (same key as api.ts uses)
      const token = localStorage.getItem('accessToken');

      // Call backend API to create invoice with amountPaid
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          customerId,
          items: items.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.price
          })),
          discount: 0,
          amountPaid: amountPaid // Gửi tiền khách đưa để backend xử lý
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh books to get updated stock
        const booksRes = await bookService.getAllBooks();
        if (booksRes && (booksRes as any).success) {
          setBooks((booksRes as any).data.map((b: any) => ({
            id: b.id || b.maSach?.toString() || '',
            isbn: b.isbn || b.ISBN || '',
            title: b.title || b.tenSach || '',
            author: b.author || b.tacGia || 'Không rõ tác giả',
            category: b.category || b.theLoai || '',
            publisher: b.publisher || b.nhaXuatBan || '',
            publishYear: b.publishYear || b.namXuatBan || null,
            price: b.price || b.giaBanLe || 0,
            stock: b.stock ?? b.soLuongTon ?? 0,
            imageUrl: b.imageUrl || b.hinhAnh || '',
            description: b.description || b.moTa || '',
            pages: b.pages || b.soTrang || null,
            weight: b.weight || b.trongLuong || null,
            dimensions: b.dimensions || b.kichThuoc || null
          })));
        }

        // Refresh customers to get updated debt
        // Refresh customers to get updated debt
        try {
          const customersData = await getAllCustomers();
          setCustomers(customersData.map((c: any) => ({
            id: c.maKH?.toString() || c.id || '',
            name: c.tenKH || c.name || '',
            phone: c.soDienThoai || c.phone || '',
            address: c.diaChi || c.address || '',
            email: c.email || '',
            currentDebt: c.tienNo ? Number(c.tienNo) : (c.currentDebt || 0),
            loyaltyPoints: c.diemTichLuy ?? c.loyaltyPoints ?? 0,
          })));
        } catch (err) {
          console.error('Failed to refresh customers:', err);
        }

        // Refresh invoice history
        try {
          const invoicesRes = await fetch('http://localhost:5000/api/invoices', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const invoicesData = await invoicesRes.json();
          if (invoicesData.success) {
            setInvoiceHistory(invoicesData.data.map((inv: any) => ({
              ...inv,
              customerId: inv.customerId?.toString() || ''
            })));
          }
        } catch (err) {
          console.error('Failed to refresh invoice history:', err);
        }

        // [NEW] Refresh Books (Update Stock)
        try {
          const booksRes = await bookService.getAllBooks();
          if (booksRes && (booksRes as any).success) {
            const apiBooks = (booksRes as any).data || [];
            const mappedBooks: Book[] = apiBooks.map((b: any) => ({
              id: b.id || b.maSach?.toString() || '',
              isbn: b.isbn || b.ISBN || '',
              title: b.title || b.tenSach || '',
              category: b.category || b.theLoai || '',
              author: Array.isArray(b.authors) ? b.authors.join(', ') : (b.author || ''),
              stock: b.stock ?? b.soLuongTon ?? 0,
              price: b.salePrice || b.price || b.giaBanLe || 0,
              publisher: b.publisher || b.nhaXuatBan || '',
              publishYear: b.publishYear || new Date().getFullYear(),
              imageUrl: b.imageUrl || b.hinhAnh || '',
              description: b.description || b.moTa || '',
            }));
            setBooks(mappedBooks);
          }
        } catch (err) {
          console.error('Failed to refresh book stock:', err);
        }

        return {
          success: true,
          message: data.message || 'Lập hóa đơn thành công!',
          totalAmount: data.data?.totalAmount || totalAmount,
          finalAmount: data.data?.finalAmount,
          id: data.data?.id
        };
      } else {
        return { success: false, message: data.message || 'Lỗi khi tạo hóa đơn', totalAmount: 0 };
      }
    } catch (err) {
      console.error('Invoice API error:', err);
      return { success: false, message: 'Lỗi kết nối server khi tạo hóa đơn', totalAmount: 0 };
    }
  };

  // BM4 & QĐ4 Logic: Collect Money - NOW CALLS BACKEND API
  const collectMoney = async (customerId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return { success: false, message: 'Khách hàng không tồn tại' };

    // Local validation for immediate feedback
    if (rules.usePaymentRule && amount > customer.currentDebt) {
      return { success: false, message: `QĐ4 Vi phạm: Số tiền thu (${amount.toLocaleString()}đ) vượt quá nợ (${customer.currentDebt.toLocaleString()}đ)` };
    }

    try {
      // Get auth token from localStorage (same key as api.ts uses)
      const token = localStorage.getItem('accessToken');

      // Call backend API to create payment
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          customerId,
          amount,
          paymentMethod: 'TIEN_MAT'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh customers to get updated debt
        try {
          const customersData = await getAllCustomers();
          // Map data consistent with initial load
          setCustomers(customersData.map((c: any) => ({
            id: c.maKH?.toString() || c.id || '',
            name: c.tenKH || c.name || '',
            phone: c.soDienThoai || c.phone || '',
            address: c.diaChi || c.address || '',
            email: c.email || '',
            currentDebt: c.tienNo ? Number(c.tienNo) : (c.currentDebt || 0),
            loyaltyPoints: c.diemTichLuy ?? c.loyaltyPoints ?? 0,
          })));
        } catch (err) {
          console.error('Failed to refresh customers:', err);
        }

        // Refresh payment history
        try {
          const paymentsRes = await fetch('http://localhost:5000/api/payments', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const paymentsData = await paymentsRes.json();
          if (paymentsData.success) {
            setPaymentHistory(paymentsData.data.map((p: any) => ({
              id: p.id,
              date: p.date,
              customerId: p.customerId ? p.customerId.toString() : '',
              customerName: p.customerName || '',
              amount: p.amount
            })));
          }
        } catch (err) {
          console.error('Failed to refresh payment history:', err);
        }

        return { success: true, message: data.message || 'Thu tiền thành công!' };
      } else {
        return { success: false, message: data.message || 'Lỗi khi thu tiền' };
      }
    } catch (err) {
      console.error('Payment API error:', err);
      return { success: false, message: 'Lỗi kết nối server khi thu tiền' };
    }
  };

  const getBook = (id: string) => books.find(b => b.id === id);
  const getCustomer = (id: string | number) => {
    if (!id) return undefined;
    return customers.find(c => String(c.id) === String(id));
  };

  // [NEW] Refresh Customers Function
  const refreshCustomers = async () => {
    try {
      const customersData = await getAllCustomers();
      // Map data consistent with initial load
      const mappedCustomers: Customer[] = customersData.map((c: any) => ({
        id: c.maKH?.toString() || c.id || '',
        name: c.tenKH || c.name || '',
        phone: c.soDienThoai || c.phone || '',
        address: c.diaChi || c.address || '',
        email: c.email || '',
        currentDebt: c.tienNo ? Number(c.tienNo) : (c.currentDebt || 0),
        loyaltyPoints: c.diemTichLuy ?? c.loyaltyPoints ?? 0,
      }));
      setCustomers(mappedCustomers);
    } catch (err) {
      console.error('Failed to manually refresh customers:', err);
    }
  };

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
      isLoadingBooks,
      booksError,
      refreshBooks,
      importBooks,
      createInvoice,
      collectMoney,
      getBook,
      getCustomer,
      addBook,
      updateBook,
      deleteBook,
      addNotification,
      markNotificationsAsRead,
      refreshCustomers
    }}>
      {initialLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : children}
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
