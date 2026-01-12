import { apiRequest } from './api';

// Types
interface InvoiceItem {
  bookId: string;
  bookName?: string;
  quantity: number;
  price: number;
  total?: number;
}

interface Invoice {
  id: string;
  date: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  employeeName?: string;
  totalAmount: number;
  discount?: number;
  finalAmount?: number;
  items: InvoiceItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả hóa đơn
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const response = await apiRequest<ApiResponse<Invoice[]>>('/invoices');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Lấy chi tiết hóa đơn
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await apiRequest<ApiResponse<Invoice>>(`/invoices/${id}`);
  return response.data;
};

// Tạo hóa đơn mới
export const createInvoiceApi = async (data: {
  customerId: string;
  items: { bookId: string; quantity: number; price: number }[];
  discount?: number;
}): Promise<Invoice> => {
  const response = await apiRequest<ApiResponse<Invoice>>('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};
