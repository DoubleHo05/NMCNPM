import { apiRequest } from './api';
import { Customer } from '../types';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả khách hàng từ database
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await apiRequest<ApiResponse<Customer[]>>('/customers');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Lấy chi tiết một khách hàng
export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await apiRequest<ApiResponse<Customer>>(`/customers/${id}`);
  return response.data;
};

// Thêm khách hàng mới
export const createCustomer = async (customerData: {
  tenKH: string;
  soDienThoai?: string;
  email?: string;
}): Promise<Customer> => {
  const response = await apiRequest<ApiResponse<Customer>>('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
  return response.data;
};

// Cập nhật khách hàng
export const updateCustomerApi = async (
  id: string,
  customerData: {
    tenKH?: string;
    soDienThoai?: string;
    email?: string;
    diemTichLuy?: number;
  }
): Promise<Customer> => {
  const response = await apiRequest<ApiResponse<Customer>>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
  return response.data;
};

// Xóa khách hàng
export const deleteCustomerApi = async (id: string): Promise<void> => {
  await apiRequest<ApiResponse<void>>(`/customers/${id}`, {
    method: 'DELETE',
  });
};
