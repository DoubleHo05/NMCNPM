import { apiRequest } from './api';

// Types
interface ImportItem {
  bookId: string;
  bookName?: string;
  quantity: number;
  price: number;
  total?: number;
}

interface ImportTicket {
  id: string;
  date: string;
  employeeName?: string;
  totalAmount?: number;
  items: ImportItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả phiếu nhập
export const getAllImports = async (): Promise<ImportTicket[]> => {
  try {
    const response = await apiRequest<ApiResponse<ImportTicket[]>>('/imports');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching imports:', error);
    throw error;
  }
};

// Lấy chi tiết phiếu nhập
export const getImportById = async (id: string): Promise<ImportTicket> => {
  const response = await apiRequest<ApiResponse<ImportTicket>>(`/imports/${id}`);
  return response.data;
};

// Tạo phiếu nhập mới
export const createImportApi = async (items: { bookId: string; quantity: number; price: number }[]): Promise<ImportTicket> => {
  const response = await apiRequest<ApiResponse<ImportTicket>>('/imports', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return response.data;
};
