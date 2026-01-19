import { apiRequest } from './api';

export interface Category {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả thể loại
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await apiRequest<ApiResponse<Category[]>>('/categories');
  return response.data;
};

// Tạo thể loại mới
export const createCategory = async (name: string): Promise<Category> => {
  const response = await apiRequest<ApiResponse<Category>>('/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  return response.data;
};
