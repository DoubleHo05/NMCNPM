import { apiRequest } from './api';

// Types
interface Payment {
  id: string;
  date: string;
  invoiceId?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  paymentMethod?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả phiếu thu
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await apiRequest<ApiResponse<Payment[]>>('/payments');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Lấy chi tiết phiếu thu
export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await apiRequest<ApiResponse<Payment>>(`/payments/${id}`);
  return response.data;
};

// Lấy lịch sử thu tiền theo khách hàng
export const getPaymentsByCustomer = async (customerId: string): Promise<Payment[]> => {
  const response = await apiRequest<ApiResponse<Payment[]>>(`/payments/customer/${customerId}`);
  return response.data || [];
};

// Tạo phiếu thu mới
export const createPaymentApi = async (data: {
  customerId: string;
  amount: number;
  paymentMethod?: 'TIEN_MAT' | 'THE_NGAN_HANG' | 'VI_DIEN_TU';
}): Promise<Payment> => {
  const response = await apiRequest<ApiResponse<Payment>>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};
