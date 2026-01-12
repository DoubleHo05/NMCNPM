import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Book, Customer, ImportTicket, Invoice, PaymentReceipt, SystemRules, Notification } from '../types';
import { INITIAL_RULES } from '../constants';
import { apiRequest } from '../services/api';

interface StoreContextType {
  books: Book[];
  customers: Customer[];
  rules: SystemRules;
  notifications: Notification[];
  importHistory: ImportTicket[];
  invoiceHistory: Invoice[];
  paymentHistory: PaymentReceipt[]; // Added payment history
  isLoading: boolean; // Loading state for API calls
  updateRules: (newRules: SystemRules) => void;
  importBooks: (items: { bookDetails: Book; quantity: number }[]) => Promise<{ success: boolean; message: string }>;
  createInvoice: (customerId: string, items: { bookId: string; quantity: number }[]) => Promise<{ success: boolean; message: string; totalAmount: number; }>;
  collectMoney: (customerId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  // Helpers
  getBook: (id: string) => Book | undefined;
  getCustomer: (id: string) => Customer | undefined;
  // CRUD Books
  addBook: (book: Book) => Promise<void>;
  updateBook: (id: string, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationsAsRead: () => void;
  // Refresh data from API
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rules, setRules] = useState<SystemRules>(INITIAL_RULES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [importHistory, setImportHistory] = useState<ImportTicket[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- API Response Types ---
  interface ApiBook {
    maSach: number;
    isbn?: string;
    tenSach: string;
    maTheLoai?: number;
    maNXB?: number;
    giaNhap: string | number;
    giaBanLe: string | number;
    soLuongTon?: number;
    moTa?: string;
    barcode?: string;
    theLoai?: { tenTheLoai: string };
    nhaXuatBan?: { tenNXB: string };
    tacGia?: { tacGia: { tenTacGia: string } }[];
  }

  interface ApiCustomer {
    maKH: number;
    tenKH?: string;
    soDienThoai?: string;
    email?: string;
    diaChi?: string;
    diemTichLuy?: number;
    congNo?: string | number;
    currentDebt?: number;
  }

  // --- Transform API data to Frontend types ---
  const transformBook = (apiBook: ApiBook): Book => ({
    id: apiBook.maSach?.toString() || '0', // Đảm bảo luôn có id hợp lệ
    title: apiBook.tenSach || 'Không tên',
    category: apiBook.theLoai?.tenTheLoai || 'Chưa phân loại',
    author: apiBook.tacGia?.map(ta => ta.tacGia.tenTacGia).join(', ') || 'Chưa rõ',
    stock: apiBook.soLuongTon || 0,
    price: Number(apiBook.giaBanLe) || 0,
    publisher: apiBook.nhaXuatBan?.tenNXB || 'Chưa rõ',
    publishYear: new Date().getFullYear(),
    description: apiBook.moTa || '',
  });

  const transformCustomer = (apiCustomer: ApiCustomer): Customer => ({
    id: apiCustomer.maKH.toString(),
    name: apiCustomer.tenKH || 'Khách lẻ',
    phone: apiCustomer.soDienThoai || '',
    address: apiCustomer.diaChi || '',
    email: apiCustomer.email || '',
    // Ưu tiên congNo từ DB, fallback về currentDebt nếu có
    currentDebt: apiCustomer.congNo 
      ? Number(apiCustomer.congNo) 
      : (apiCustomer.currentDebt || 0),
  });

  // --- Fetch data from API ---
  const fetchBooks = useCallback(async (): Promise<Book[]> => {
    try {
      // Lấy tất cả sách với limit cao để tránh pagination
      const response = await apiRequest<{ success: boolean; data: ApiBook[] | { books: ApiBook[] } }>('/books?limit=1000');
      const booksData = Array.isArray(response.data) ? response.data : response.data.books;
      // Lọc bỏ các sách không có maSach hợp lệ
      return booksData
        .filter(book => book.maSach !== undefined && book.maSach !== null)
        .map(transformBook);
    } catch (error) {
      console.warn('Không thể lấy dữ liệu sách từ API:', error);
      // Trả về mảng rỗng thay vì INITIAL_BOOKS để tránh lỗi ID không đồng bộ
      return [];
    }
  }, []);

  const fetchCustomers = useCallback(async (): Promise<Customer[]> => {
    try {
      // Lấy tất cả khách hàng với limit cao để tránh pagination
      const response = await apiRequest<{ success: boolean; data: ApiCustomer[] | { customers: ApiCustomer[] } }>('/customers?limit=1000');
      const customersData = Array.isArray(response.data) ? response.data : response.data.customers;
      return customersData.map(transformCustomer);
    } catch (error) {
      console.warn('Không thể lấy dữ liệu khách hàng từ API:', error);
      // Trả về mảng rỗng thay vì INITIAL_CUSTOMERS để tránh lỗi ID không đồng bộ
      return [];
    }
  }, []);

  const fetchRules = useCallback(async (): Promise<SystemRules> => {
    try {
      const response = await apiRequest<{ success: boolean; data: SystemRules }>('/settings/rules');
      return response.data;
    } catch (error) {
      console.warn('Không thể lấy quy định từ API, sử dụng quy định mặc định:', error);
      return INITIAL_RULES;
    }
  }, []);

  // --- Refresh all data from API ---
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [booksData, customersData, rulesData] = await Promise.all([
        fetchBooks(),
        fetchCustomers(),
        fetchRules(),
      ]);
      setBooks(booksData);
      setCustomers(customersData);
      setRules(rulesData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBooks, fetchCustomers, fetchRules]);

  // --- Load data on mount ---
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    setIsLoading(true);
    try {
      await apiRequest('/settings/rules', {
        method: 'PUT',
        body: JSON.stringify(newRules),
      });
      setRules(newRules);
      addNotification({ type: 'settings', title: 'Cập nhật quy định', message: 'Đã lưu quy định thành công!' });
    } catch (error: any) {
      addNotification({ type: 'info', title: 'Lỗi', message: error.message || 'Không thể cập nhật quy định' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Books Operations - Connected to API (No offline fallback)
  const addBook = async (book: Book) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ success: boolean; data: ApiBook }>('/books', {
        method: 'POST',
        body: JSON.stringify({
          tenSach: book.title,
          giaBanLe: book.price,
          giaNhap: book.price * 0.7,
          soLuongTon: book.stock,
          moTa: book.description,
        }),
      });
      if (response.success) {
        await refreshData();
        addNotification({ type: 'info', title: 'Thêm sách', message: `Đã thêm "${book.title}" thành công!` });
      }
    } catch (error: any) {
      addNotification({ type: 'info', title: 'Lỗi', message: error.message || 'Không thể thêm sách' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBook = async (id: string, updatedFields: Partial<Book>) => {
    setIsLoading(true);
    try {
      await apiRequest(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          tenSach: updatedFields.title,
          giaBanLe: updatedFields.price,
          soLuongTon: updatedFields.stock,
          moTa: updatedFields.description,
        }),
      });
      await refreshData();
      addNotification({ type: 'info', title: 'Cập nhật sách', message: 'Đã cập nhật thông tin sách!' });
    } catch (error: any) {
      addNotification({ type: 'info', title: 'Lỗi', message: error.message || 'Không thể cập nhật sách' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBook = async (id: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/books/${id}`, {
        method: 'DELETE',
      });
      await refreshData();
      addNotification({ type: 'info', title: 'Xóa sách', message: 'Đã xóa sách thành công!' });
    } catch (error: any) {
      addNotification({ type: 'info', title: 'Lỗi', message: error.message || 'Không thể xóa sách' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // BM1 & QĐ1 Logic: Import Books - Connected to API (No offline fallback)
  const importBooks = async (items: { bookDetails: Book; quantity: number }[]): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const importItems = items.map(item => ({
        maSach: parseInt(item.bookDetails.id),
        soLuongNhap: item.quantity,
        giaNhap: item.bookDetails.price * 0.7,
      }));

      const result = await apiRequest<{ success: boolean; message: string; data?: any }>('/imports', {
        method: 'POST',
        body: JSON.stringify({ items: importItems }),
      });

      if (result.success) {
        await refreshData();
        addNotification({ type: 'import', title: 'Nhập sách', message: result.message || 'Nhập sách thành công!' });
        return { success: true, message: result.message || 'Nhập sách thành công!' };
      }
      return { success: false, message: result.message || 'Nhập sách thất bại' };
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể nhập sách. Vui lòng kiểm tra kết nối server.';
      addNotification({ type: 'info', title: 'Lỗi nhập sách', message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // BM2 & QĐ2 Logic: Sell Books - Connected to API (No offline fallback)
  const createInvoice = async (customerId: string, items: { bookId: string; quantity: number }[]): Promise<{ success: boolean; message: string; totalAmount: number }> => {
    setIsLoading(true);
    try {
      // Validate items trước khi gửi
      if (!items || items.length === 0) {
        return { success: false, message: 'Giỏ hàng trống. Vui lòng thêm sách.', totalAmount: 0 };
      }

      // Map bookId (maSach) -> isbn dạng số để khớp với Backend API
      // Backend sẽ tìm sách theo maSach nếu isbn là number
      const invoiceItems = items.map(item => {
        const maSach = parseInt(item.bookId, 10);
        if (isNaN(maSach)) {
          throw new Error(`Mã sách không hợp lệ: ${item.bookId}`);
        }
        return {
          isbn: maSach, // Gửi maSach dưới dạng number
          quantity: item.quantity,
        };
      });

      // Log để debug
      console.log('Creating invoice with items:', invoiceItems);

      const result = await apiRequest<{ success: boolean; message: string; data?: { maHoaDon: number; tongTien: number; thanhTien?: number } }>('/sales/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerId: customerId ? parseInt(customerId, 10) : null,
          items: invoiceItems,
          discount: 0,
        }),
      });

      if (result.success && result.data) {
        await refreshData();
        const totalAmount = Number(result.data.tongTien || result.data.thanhTien || 0);
        addNotification({ 
          type: 'invoice', 
          title: 'Lập hóa đơn', 
          message: `Hóa đơn #${result.data.maHoaDon} - ${totalAmount.toLocaleString()}đ` 
        });
        return { 
          success: true, 
          message: `Lập hóa đơn #${result.data.maHoaDon} thành công!`, 
          totalAmount 
        };
      }
      return { success: false, message: result.message || 'Lập hóa đơn thất bại', totalAmount: 0 };
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể lập hóa đơn. Vui lòng kiểm tra kết nối server.';
      addNotification({ type: 'info', title: 'Lỗi lập hóa đơn', message: errorMessage });
      return { success: false, message: errorMessage, totalAmount: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // BM4 & QĐ4 Logic: Collect Money - Connected to API (No offline fallback)
  const collectMoney = async (customerId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const result = await apiRequest<{ success: boolean; message: string; data?: any }>('/payments', {
        method: 'POST',
        body: JSON.stringify({
          customerId: parseInt(customerId),
          amount: amount,
          paymentMethod: 'TIEN_MAT',
        }),
      });

      if (result.success) {
        await refreshData();
        addNotification({ 
          type: 'payment', 
          title: 'Thu tiền', 
          message: `Đã thu ${amount.toLocaleString()}đ thành công!` 
        });
        return { success: true, message: result.message || 'Thu tiền thành công!' };
      }
      return { success: false, message: result.message || 'Thu tiền thất bại' };
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể thu tiền. Vui lòng kiểm tra kết nối server.';
      addNotification({ type: 'info', title: 'Lỗi thu tiền', message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
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
      isLoading,
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
      markNotificationsAsRead,
      refreshData,
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
